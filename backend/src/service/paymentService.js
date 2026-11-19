import crypto from "node:crypto";
import Razorpay from "razorpay";
import { Op } from "sequelize";

import { connectDatabase, sequelize } from "../database/database.js";
import { coupons } from "../model/coupans.js";
import { order } from "../model/order.js";
import { order_item } from "../model/orderItem.js";
import { payment } from "../model/payment.js";
import { Product } from "../model/product.js";
import { User } from "../model/user.js";

const CURRENCY = "INR";
const FREE_DELIVERY_MINIMUM = 999;
const DELIVERY_CHARGE = 49;

let razorpayClient;

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayClient;
};

const round2 = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const toPaise = (value) => Math.round(round2(value) * 100);

const databaseError = (connection) =>
  connection && connection.status === 0 ? connection : null;

/**
 * Creates a Razorpay order and a matching pending order in our database.
 * The amount is always recalculated on the server so the client cannot
 * tamper with the price.
 */
export const create_payment_order_service = async (payload) => {
  try {
    const connection = await connectDatabase();
    const dbError = databaseError(connection);
    if (dbError) return dbError;

    const user = await User.findOne({
      where: { id: payload.userId, is_deleted: false },
    });

    if (!user) {
      return {
        status: 0,
        status_code: 404,
        message: "User does not exist",
      };
    }

    // Merge duplicate product ids coming from the cart.
    const requestedQuantities = new Map();
    for (const item of payload.items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);
      requestedQuantities.set(
        productId,
        (requestedQuantities.get(productId) || 0) + quantity
      );
    }

    const products = await Product.findAll({
      where: {
        id: [...requestedQuantities.keys()],
        isActive: true,
      },
    });

    const productsById = new Map(products.map((p) => [Number(p.id), p]));

    let subtotal = 0;
    const orderItems = [];

    for (const [productId, quantity] of requestedQuantities) {
      const product = productsById.get(productId);

      if (!product) {
        return {
          status: 0,
          status_code: 404,
          message: "Some selected products are not available",
        };
      }

      if (quantity > Number(product.stock)) {
        return {
          status: 0,
          status_code: 400,
          message: `${product.name} has insufficient stock`,
        };
      }

      const unitPrice = round2(
        Number(product.price) *
          (1 - Number(product.discountPercentage || 0) / 100)
      );

      subtotal = round2(subtotal + unitPrice * quantity);

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        price: unitPrice,
        quantity,
        is_deleted: false,
      });
    }

    if (subtotal <= 0) {
      return {
        status: 0,
        status_code: 400,
        message: "Invalid order amount",
      };
    }

    const delivery =
      subtotal >= FREE_DELIVERY_MINIMUM ? 0 : DELIVERY_CHARGE;

    let coupon = null;
    let couponDiscount = 0;

    if (payload.coupon_code) {
      const code = String(payload.coupon_code).trim().toUpperCase();

      coupon = await coupons.findOne({
        where: {
          code,
          isActive: true,
          expiryDate: { [Op.gt]: new Date() },
        },
      });

      if (!coupon) {
        return {
          status: 0,
          status_code: 400,
          message: "Coupon is invalid or expired",
        };
      }

      if (Number(coupon.usedCount) >= Number(coupon.usageLimit)) {
        return {
          status: 0,
          status_code: 400,
          message: "Coupon usage limit has been reached",
        };
      }

      if (subtotal < Number(coupon.minimumOrderAmount)) {
        return {
          status: 0,
          status_code: 400,
          message: "Cart does not meet the coupon minimum amount",
        };
      }

      couponDiscount = round2(
        Math.min(
          subtotal,
          (subtotal * Number(coupon.discountPercentage)) / 100
        )
      );
    }

    const totalAmount = round2(subtotal + delivery - couponDiscount);

    if (totalAmount <= 0) {
      return {
        status: 0,
        status_code: 400,
        message: "Invalid order amount",
      };
    }

    const razorpayOrder = await getRazorpayClient().orders.create({
      amount: toPaise(totalAmount),
      currency: CURRENCY,
      receipt: `receipt_${Date.now()}_${payload.userId}`,
      notes: {
        user_id: String(payload.userId),
      },
    });

    const transaction = await sequelize.transaction();
    let createdOrder;

    try {
      createdOrder = await order.create(
        {
          user_id: payload.userId,
          total_amount: totalAmount,
          discount_amount: couponDiscount,
          status: false,
          is_deleted: false,
        },
        { transaction }
      );

      await order_item.bulkCreate(
        orderItems.map((item) => ({
          ...item,
          order_id: createdOrder.id,
        })),
        { transaction }
      );

      await payment.create(
        {
          order_id: createdOrder.id,
          razorpay_order_id: razorpayOrder.id,
          coupon_code: coupon ? coupon.code : null,
          amount: totalAmount,
          currency: CURRENCY,
          status: "created",
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return {
      status: 1,
      status_code: 200,
      message: "Payment order created successfully",
      data: {
        key: process.env.RAZORPAY_KEY_ID,
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || CURRENCY,
        order_reference: createdOrder.id,
      },
    };
  } catch (error) {
    throw {
      status: 0,
      status_code: 400,
      message: error.message || "Unable to create payment order",
    };
  }
};

/**
 * Verifies the signature sent by Razorpay and confirms the order only when
 * the signature is valid.
 */
export const verify_payment_service = async (payload) => {
  try {
    const connection = await connectDatabase();
    const dbError = databaseError(connection);
    if (dbError) return dbError;

    if (
      !process.env.RAZORPAY_KEY_SECRET ||
      !payload.razorpay_order_id ||
      !payload.razorpay_payment_id ||
      !payload.razorpay_signature
    ) {
      return {
        status: 0,
        status_code: 400,
        message: "Missing payment verification details",
      };
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        `${payload.razorpay_order_id}|${payload.razorpay_payment_id}`
      )
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(String(payload.razorpay_signature), "utf8");

    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      return {
        status: 0,
        status_code: 400,
        message: "Invalid payment signature",
      };
    }

    const paymentRecord = await payment.findOne({
      where: { razorpay_order_id: payload.razorpay_order_id },
      include: [{ model: order, as: "order" }],
    });

    if (!paymentRecord) {
      return {
        status: 0,
        status_code: 404,
        message: "Payment order not found",
      };
    }

    if (
      Number(paymentRecord.order_id) !== Number(payload.order_id) ||
      Number(paymentRecord.order.user_id) !== Number(payload.userId)
    ) {
      return {
        status: 0,
        status_code: 403,
        message: "Unauthorized payment verification",
      };
    }

    if (paymentRecord.status === "paid") {
      return {
        status: 1,
        status_code: 200,
        message: "Payment already verified",
        data: {
          order_id: paymentRecord.order_id,
          amount: paymentRecord.amount,
          payment_id: paymentRecord.razorpay_payment_id,
        },
      };
    }

    const transaction = await sequelize.transaction();

    try {
      const lockedPayment = await payment.findOne({
        where: { id: paymentRecord.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (lockedPayment.status !== "paid") {
        await lockedPayment.update(
          {
            razorpay_payment_id: payload.razorpay_payment_id,
            razorpay_signature: payload.razorpay_signature,
            status: "paid",
          },
          { transaction }
        );

        await order.update(
          { status: true },
          {
            where: { id: lockedPayment.order_id },
            transaction,
          }
        );

        const items = await order_item.findAll({
          where: { order_id: lockedPayment.order_id },
          transaction,
        });

        for (const item of items) {
          await Product.decrement(
            "stock",
            {
              by: Number(item.quantity),
              where: { id: item.product_id },
              transaction,
            }
          );
        }

        if (lockedPayment.coupon_code) {
          await coupons.increment(
            "usedCount",
            {
              where: { code: lockedPayment.coupon_code },
              transaction,
            }
          );
        }
      }

      await transaction.commit();

      return {
        status: 1,
        status_code: 200,
        message: "Payment verified successfully",
        data: {
          order_id: lockedPayment.order_id,
          amount: lockedPayment.amount,
          payment_id: payload.razorpay_payment_id,
        },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    throw {
      status: 0,
      status_code: 400,
      message: error.message || "Payment verification failed",
    };
  }
};

/** Marks an abandoned/failed checkout so it never appears in history. */
export const mark_payment_failed_service = async (payload) => {
  try {
    const connection = await connectDatabase();
    const dbError = databaseError(connection);
    if (dbError) return dbError;

    const paymentRecord = await payment.findOne({
      where: { order_id: payload.order_id },
      include: [{ model: order, as: "order" }],
    });

    if (!paymentRecord) {
      return {
        status: 0,
        status_code: 404,
        message: "Payment record not found",
      };
    }

    if (Number(paymentRecord.order.user_id) !== Number(payload.userId)) {
      return {
        status: 0,
        status_code: 403,
        message: "Unauthorized payment request",
      };
    }

    if (paymentRecord.status === "paid") {
      return {
        status: 1,
        status_code: 200,
        message: "Payment is already completed",
      };
    }

    await paymentRecord.update({
      status: "failed",
      razorpay_payment_id: payload.razorpay_payment_id || null,
    });

    await order.update(
      { is_deleted: true },
      { where: { id: paymentRecord.order_id } }
    );

    return {
      status: 1,
      status_code: 200,
      message: "Failed payment recorded",
    };
  } catch (error) {
    throw {
      status: 0,
      status_code: 400,
      message: error.message || "Unable to record failed payment",
    };
  }
};
