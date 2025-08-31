import Joi from "joi";

export const draftPageSchema = Joi.object({
  draftContent: Joi.string().allow("").required(),
});

export const publishPageSchema = Joi.object({
  content: Joi.string().allow("").required(),
});

export const createPageSchema = Joi.object({
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
  content: Joi.string().allow("").required(),
});