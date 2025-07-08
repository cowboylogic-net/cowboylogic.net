import Joi from "joi";

export const createBookSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  author: Joi.string().min(2).max(255).required(),
  description: Joi.string().allow("").max(2000),
  price: Joi.number().precision(2).positive().required(),
  partnerPrice: Joi.number().precision(2).positive().optional(),
  imageUrl: Joi.string().uri().optional(),
  inStock: Joi.boolean().truthy("true").falsy("false").optional(),
  stock: Joi.number().integer().min(0).required(),
  isWholesaleAvailable: Joi.boolean().truthy("true").falsy("false").optional(),
});

export const updateBookSchema = Joi.object({
  title: Joi.string().min(2).max(255),
  author: Joi.string().min(2).max(255),
  description: Joi.string().allow("").max(2000),
  price: Joi.number().precision(2).positive(),
  partnerPrice: Joi.number().precision(2).positive().optional(),
  stock: Joi.number().integer().min(0),
  imageUrl: Joi.string()
    .custom((value, helpers) => {
      if (!value) return value;
      if (value.startsWith("/uploads/")) return value;

      try {
        new URL(value);
        return value;
      } catch {
        return helpers.error("any.invalid");
      }
    }, "imageUrl validation")
    .optional(),
  inStock: Joi.boolean().truthy("true").falsy("false").optional(),
  isWholesaleAvailable: Joi.boolean().truthy("true").falsy("false").optional(),
}).min(1);
