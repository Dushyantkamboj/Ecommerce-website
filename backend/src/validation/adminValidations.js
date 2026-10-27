import joi from 'joi';
 
export const admin_register_schema=joi.object({
    admin_secret_key:joi.string().required()
})

export const admin_login_schema=joi.object({
    email:joi.string().email().required(),
    password:joi.string().required()
});

export const delete_user_schema=joi.object({
    id:joi.number().required()
})

export const create_coupon_Schema = joi.object({
  code: joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Coupon code is required",
      "string.min": "Coupon code must be at least 3 characters",
      "string.max": "Coupon code cannot exceed 50 characters",
      "string.pattern.base":
        "Coupon code can contain only letters, numbers, underscores, and hyphens",
      "any.required": "Coupon code is required",
    }),

  discountPercentage: joi.number()
    .min(0.01)
    .max(100)
    .precision(2)
    .required()
    .messages({
      "number.base": "Discount percentage must be a number",
      "number.min": "Discount must be greater than 0",
      "number.max": "Discount cannot exceed 100%",
      "number.precision": "Discount can have at most 2 decimal places",
      "any.required": "Discount percentage is required",
    }),

  minimumOrderAmount: joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      "number.base": "Minimum order amount must be a number",
      "number.min": "Minimum order amount cannot be negative",
      "number.precision":
        "Minimum order amount can have at most 2 decimal places",
      "any.required": "Minimum order amount is required",
    }),

  expiryDate: joi.date()
    .iso()
    .greater("now")
    .required()
    .messages({
      "date.base": "Please provide a valid expiry date",
      "date.format": "Expiry date must be in ISO date format",
      "date.greater": "Expiry date must be in the future",
      "any.required": "Expiry date is required",
    }),

  usageLimit: joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "Usage limit must be a number",
      "number.integer": "Usage limit must be an integer",
      "number.min": "Usage limit must be at least 1",
      "any.required": "Usage limit is required",
    }),
});
