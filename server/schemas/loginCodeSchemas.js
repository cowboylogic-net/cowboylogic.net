import Joi from "joi";

export const requestLoginCodeSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required(),
});

export const verifyLoginCodeSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required(),
  code: Joi.string().required(),
});
