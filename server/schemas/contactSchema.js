import Joi from "joi";

export const contactSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  message: Joi.string().allow("").max(2000),
  comment: Joi.string().allow("").max(2000),
}).xor("message", "comment"); // рівно одне з двох
