
import Joi from "joi";

export const add_product_schema = Joi.object({
    productname: Joi.string().trim().min(2).max(150).required(),
    description: Joi.string().trim().required(),
    price: Joi.number().greater(0).required(),
    stock: Joi.number().integer().min(0).required(),
    image: Joi.string().uri().allow("", null),
    isActive: Joi.boolean().default(true),
});

export const update_product_schema = Joi.object({
    productname: Joi.string().trim().min(2).max(150),
    description: Joi.string().trim(),
    price: Joi.number().greater(0),
    stock: Joi.number().integer().min(0),
    image: Joi.string().uri().allow("", null),
    isActive: Joi.boolean(),
}).min(1);

export const delete_product_schema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

export const product_details_schema = Joi.object({
  productIds: Joi.array()
    .items(Joi.number().integer().positive().required())
    .min(1)
    .unique()
    .required(),
});

export const buying_product_schema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number()
          .integer()
          .positive()
          .required(),

        quantity: Joi.number()
          .integer()
          .min(1)
          .required(),
      }).required()
    )
    .min(1)
    .required(),

  coupon_code: Joi.string()
    .trim()
    .uppercase()
    .allow(null)
    .optional(),

  total_amount: Joi.number()
    .positive()
    .required(),

    discount_amount: Joi.number()
});



