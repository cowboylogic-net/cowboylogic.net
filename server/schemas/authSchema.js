import Joi from "joi";

const emailRegexp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const authRegisterSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(emailRegexp)
    .required()
    .messages({
      "string.pattern.base":
        "Email must be in a valid format like user@example.com",
    }),

  password: Joi.string().min(6).max(50).required(),

  repeatPassword: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords must match" }),

  fullName: Joi.string().min(2).max(100).required(),

  phoneNumber: Joi.string().optional(),

  role: Joi.string().valid("user", "partner").required(),

  newsletter: Joi.boolean().optional(),

  heardAboutUs: Joi.string().max(200).optional(),

  termsAgreed: Joi.boolean().valid(true).required().messages({
    "any.only": "You must agree to the terms and conditions",
  }),

  partnerProfile: Joi.when("role", {
    is: "partner",
    then: Joi.object({
      organizationName: Joi.string().required(),
      businessType: Joi.string().optional(),
      address: Joi.string().optional(),
      address2: Joi.string().optional(),
      billingAddress: Joi.string().optional(),
      city: Joi.string().optional(),
      postalCode: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      contactPhone: Joi.string().allow(""),
      businessWebsite: Joi.string().uri().allow(""),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
});

export const authLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(emailRegexp)
    .required()
    .messages({
      "string.pattern.base":
        "Email must be in a valid format like user@example.com",
    }),
  password: Joi.string().required(),
});
export const verifyEmailCodeSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(emailRegexp)
    .required()
    .messages({
      "string.pattern.base":
        "Email must be in a valid format like user@example.com",
    }),

  code: Joi.string().trim().length(6).required().messages({
  "string.length": "Code must be 6 characters long",
}),

});
