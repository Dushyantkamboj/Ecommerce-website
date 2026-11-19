import Joi from "joi";

export const create_payment_order_schema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),

  coupon_code: Joi.string().trim().uppercase().allow(null, "").optional(),

  // The server recalculates the final amount from the database. These two
  // fields are only kept so the checkout request matches the cart UI.
  total_amount: Joi.number().positive().required(),
  discount_amount: Joi.number().min(0).optional(),
});

export const verify_payment_schema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  razorpay_order_id: Joi.string().trim().required(),
  razorpay_payment_id: Joi.string().trim().required(),
  razorpay_signature: Joi.string().trim().required(),
});

export const payment_failed_schema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  razorpay_payment_id: Joi.string().trim().allow(null, "").optional(),
  reason: Joi.string().trim().allow(null, "").optional(),
});
