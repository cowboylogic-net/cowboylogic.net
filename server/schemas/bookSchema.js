// server/schemas/bookSchemas.js
import Joi from "joi";

export const createBookSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  author: Joi.string().min(2).max(255).required(),
  description: Joi.string().allow("").max(2000),
  price: Joi.number().precision(2).positive().required(),
  imageUrl: Joi.string().uri().optional(),
  inStock: Joi.boolean().optional(),
  stock: Joi.number().integer().min(0).required(),

});

export const updateBookSchema = Joi.object({
  title: Joi.string().min(2).max(255),
  author: Joi.string().min(2).max(255),
  description: Joi.string().allow("").max(2000),
  price: Joi.number().precision(2).positive(),
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
  inStock: Joi.boolean(),
}).min(1); // при оновленні хоча б одне поле обов'язкове

