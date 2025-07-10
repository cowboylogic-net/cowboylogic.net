import Joi from "joi";

export const requestLoginCodeSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyLoginCodeSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().trim().length(6).required(),
});