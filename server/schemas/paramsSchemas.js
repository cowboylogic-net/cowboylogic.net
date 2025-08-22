import Joi from "joi";

export const uuidParamSchema = Joi.object({
  bookId: Joi.string().uuid().required(),
});
export const slugParamSchema = Joi.object({
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
});
export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const cartItemIdParamSchema = Joi.object({
  itemId: Joi.string().uuid().required(),
});
