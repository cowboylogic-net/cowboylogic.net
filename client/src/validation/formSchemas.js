import * as yup from "yup";

const FORMAT_VALUES = [
  "PAPERBACK",
  "HARDCOVER",
  "EBOOK_EPUB",
  "KINDLE_AMAZON",
  "AUDIOBOOK",
];

const toUpper = (value) => String(value || "").toUpperCase();

// BookForm schema
export const bookFormSchema = (t) =>
  yup.object().shape({
    title: yup.string().required(t("bookForm.titleRequired")),
    author: yup.string().required(t("bookForm.authorRequired")),
    description: yup.string(),
    price: yup
      .number()
      .typeError(t("bookForm.priceType"))
      .positive(t("bookForm.pricePositive"))
      .required(t("bookForm.priceRequired")),
    inStock: yup.boolean(),
    stock: yup
      .number()
      .required(t("validation.required"))
      .min(0, t("validation.minStock"))
      .typeError(t("validation.mustBeNumber")),
    format: yup
      .string()
      .oneOf(FORMAT_VALUES, t("bookForm.formatInvalid"))
      .required(t("bookForm.formatRequired")),
    displayOrder: yup
      .number()
      .typeError(t("bookForm.displayOrderType"))
      .integer(t("bookForm.displayOrderInteger"))
      .min(0, t("bookForm.displayOrderMin"))
      .required(t("bookForm.displayOrderRequired")),
    amazonUrl: yup
      .string()
      .trim()
      .transform((value) => (value === "" ? null : value))
      .nullable()
      .when("format", (formatValue, schema) => {
        if (toUpper(formatValue) === "KINDLE_AMAZON") {
          return schema
            .required(t("bookForm.amazonUrlRequired"))
            .url(t("validation.invalidUrl"));
        }
        return schema.notRequired().url(t("validation.invalidUrl"));
      }),
    downloadUrl: yup
      .string()
      .trim()
      .transform((value) => (value === "" ? null : value))
      .nullable()
      .when("format", (formatValue, schema) => {
        if (toUpper(formatValue) === "KINDLE_AMAZON") {
          return schema.test(
            "downloadUrl-null-for-kindle",
            t("bookForm.downloadUrlNotAllowed"),
            (value) => !value
          );
        }
        return schema.notRequired().url(t("validation.invalidUrl"));
      }),
  });

// ContactForm schema
export const contactFormSchema = (t) =>
  yup.object().shape({
    firstName: yup.string().required(t("contact.firstNameRequired")),
    lastName: yup.string().required(t("contact.lastNameRequired")),
    email: yup
      .string()
      .email(t("contact.invalidEmail"))
      .required(t("contact.emailRequired")),
    message: yup
      .string()
      .min(10, t("contact.messageMin"))
      .required(t("contact.messageRequired")),
  });

export const newsletterFormSchema = (t) =>
  yup.object({
    subject: yup
      .string()
      .trim()
      .min(1, t("newsletter.subjectTooShort"))
      .max(200, t("newsletter.subjectTooLong"))
      .required(t("newsletter.subjectRequired")),
    content: yup
      .string()
      .test("not-empty-html", t("newsletter.contentRequired"), (value) => {
        const plain = String(value || "")
          .replace(/<[^>]*>/g, "")
          .trim();
        return plain.length > 0;
      })
      .required(t("newsletter.contentRequired")),
  });

// Newsletter Signup schema (email only)
export const newsletterSignupSchema = (t) =>
  yup.object({
    email: yup
      .string()
      .email(t("contact.invalidEmail"))
      .required(t("contact.emailRequired")),
  });

export const loginFormSchema = (t) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("form.errors.email"))
      .required(t("form.errors.required")),
    password: yup
      .string()
      .min(6, t("form.errors.passwordShort"))
      .required(t("form.errors.required")),
  });

// Code verification schema (Step 2)
export const codeVerificationSchema = (t) =>
  yup.object().shape({
    code: yup.string().required(t("form.errors.required")),
  });

export const registerFormSchema = (t) =>
  yup.object().shape({
    fullName: yup.string().required(t("form.errors.required")),

    email: yup
      .string()
      .email(t("form.errors.email"))
      .required(t("form.errors.required")),

    password: yup
      .string()
      .min(6, t("form.errors.passwordShort"))
      .required(t("form.errors.required")),

    repeatPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("form.errors.passwordsMustMatch"))
      .required(t("form.errors.required")),

    phoneNumber: yup.string().nullable().notRequired(),

    heardAboutUs: yup.string().nullable().notRequired(),

    newsletter: yup.boolean(),

    isPartner: yup.boolean(),

    termsAgreed: yup.boolean().oneOf([true], t("form.errors.termsRequired")),

    gdprConsentAt: yup.date().nullable().notRequired(),

    role: yup.string().oneOf(["user", "partner"]).notRequired(),

    partnerProfile: yup.object().when("isPartner", {
      is: true,
      then: (schema) =>
        schema.shape({
          organizationName: yup.string().required(t("form.errors.required")),
          businessType: yup.string().nullable(),
          address: yup.string().nullable(),
          address2: yup.string().nullable(),
          billingAddress: yup.string().nullable(),
          city: yup.string().nullable(),
          postalCode: yup.string().nullable(),
          state: yup.string().nullable(),
          country: yup.string().nullable(),
          contactPhone: yup.string().nullable().notRequired(),
          businessWebsite: yup
            .string()
            .url(t("form.errors.invalidUrl"))
            .nullable()
            .notRequired(),
        }),
      otherwise: (schema) => schema.strip(), // якщо не партнер — видаляємо об'єкт
    }),
  });

// Code verification schema (Step 2)
export const registerCodeSchema = (t) =>
  yup.object().shape({
    code: yup
      .string()
      .trim()
      .matches(/^[A-Z0-9_]{6}$/i, t("form.errors.codeLength")) // будь-який регістр
      .required(t("form.errors.required")),
  });
