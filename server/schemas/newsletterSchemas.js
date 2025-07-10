import Joi from "joi";

export const subscribeNewsletterSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const sendNewsletterSchema = Joi.object({
  subject: Joi.string().min(1).required(),
  content: Joi.string().min(1).required(),
});