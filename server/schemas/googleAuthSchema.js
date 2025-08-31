import Joi from "joi";

export const googleAuthSchema = Joi.object({
  id_token: Joi.string().required(),
});