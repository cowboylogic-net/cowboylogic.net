// schemas/meSchemas.js
import Joi from "joi";

export const userSelfUpdateSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  phoneNumber: Joi.string().allow("", null),
  newsletter: Joi.boolean(),
  heardAboutUs: Joi.string().max(200).allow("", null),
}).min(1);

export const partnerProfileUpsertSchema = Joi.object({
  organizationName: Joi.string(), // не вимагаємо тут — перевіримо в контролері для create
  businessType: Joi.string().allow("", null),
  address: Joi.string().allow("", null),
  address2: Joi.string().allow("", null),
  billingAddress: Joi.string().allow("", null),
  city: Joi.string().allow("", null),
  state: Joi.string().allow("", null),
  postalCode: Joi.string().allow("", null),
  country: Joi.string().allow("", null),
  contactPhone: Joi.string().allow("", null),
  businessWebsite: Joi.string().uri().allow("", null, ""),
}).min(1);
