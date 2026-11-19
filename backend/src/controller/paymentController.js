import {
  create_payment_order_service,
  mark_payment_failed_service,
  verify_payment_service,
} from "../service/paymentService.js";

const respond = (res, response) =>
  res.status(response.status_code).json(response);

const checkCustomer = (req, res) => {
  if (Number(req.user?.type) !== 2) {
    respond(res, {
      status: 0,
      status_code: 403,
      message: "Only customers can place orders",
    });
    return false;
  }

  return true;
};

export const create_payment_order_controller = async (req, res) => {
  if (!checkCustomer(req, res)) return;

  try {
    const response = await create_payment_order_service({
      ...req.body,
      userId: req.user.userId,
    });

    return respond(res, response);
  } catch (error) {
    return respond(res, {
      status: error.status || 0,
      status_code: error.status_code || 400,
      message: error.message || "Unable to create payment order",
    });
  }
};

export const verify_payment_controller = async (req, res) => {
  if (!checkCustomer(req, res)) return;

  try {
    const response = await verify_payment_service({
      ...req.body,
      userId: req.user.userId,
    });

    return respond(res, response);
  } catch (error) {
    return respond(res, {
      status: error.status || 0,
      status_code: error.status_code || 400,
      message: error.message || "Unable to verify payment",
    });
  }
};

export const payment_failed_controller = async (req, res) => {
  if (!checkCustomer(req, res)) return;

  try {
    const response = await mark_payment_failed_service({
      ...req.body,
      userId: req.user.userId,
    });

    return respond(res, response);
  } catch (error) {
    return respond(res, {
      status: error.status || 0,
      status_code: error.status_code || 400,
      message: error.message || "Unable to record failed payment",
    });
  }
};
