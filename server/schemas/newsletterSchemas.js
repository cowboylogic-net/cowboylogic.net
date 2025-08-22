import Joi from "joi";

export const subscribeSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const sendSchema = Joi.object({
  subject: Joi.string().trim().min(1).max(200).required(),
  content: Joi.string().allow("").required(), // HTML з адмінки
});
