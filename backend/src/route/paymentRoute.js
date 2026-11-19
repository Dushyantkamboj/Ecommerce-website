import express from "express";

import { authentication } from "../middleware/authentication.js";
import { validation } from "../middleware/validationMiddleware.js";
import {
  create_payment_order_controller,
  payment_failed_controller,
  verify_payment_controller,
} from "../controller/paymentController.js";
import {
  create_payment_order_schema,
  payment_failed_schema,
  verify_payment_schema,
} from "../validation/paymentValidations.js";

const router = express.Router();

router.post(
  "/create-order",
  authentication,
  validation(create_payment_order_schema, "body"),
  create_payment_order_controller
);

router.post(
  "/verify",
  authentication,
  validation(verify_payment_schema, "body"),
  verify_payment_controller
);

router.post(
  "/failed",
  authentication,
  validation(payment_failed_schema, "body"),
  payment_failed_controller
);

export { router as paymentRoute };
