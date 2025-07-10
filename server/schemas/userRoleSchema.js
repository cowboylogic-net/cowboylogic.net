import Joi from "joi";

export const userRoleSchema = Joi.object({
  role: Joi.string().valid("user", "partner", "admin", "superAdmin").required(),
});