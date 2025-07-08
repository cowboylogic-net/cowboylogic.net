// 📁 /schemas/cartSchemas.js
import Joi from "joi";

export const addToCartSchema = Joi.object({
  bookId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).default(1),
});

export const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});
