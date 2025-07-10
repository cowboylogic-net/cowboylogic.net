import Joi from "joi";

export const addFavoriteSchema = Joi.object({
  bookId: Joi.string().uuid().required(),
});