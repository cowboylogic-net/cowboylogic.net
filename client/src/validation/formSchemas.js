import * as yup from "yup";

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

// Newsletter Admin schema (subject + content)
export const newsletterFormSchema = (t) =>
  yup.object().shape({
    subject: yup
      .string()
      .trim()
      .min(3, t("newsletter.subjectTooShort"))
      .required(t("newsletter.subjectRequired")),
    content: yup
      .string()
      .trim()
      .min(10, t("newsletter.contentTooShort"))
      .required(t("newsletter.contentRequired")),
  });

// Newsletter Signup schema (email only)
export const newsletterSignupSchema = (t) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("form.errors.email"))
      .required(t("form.errors.required")),
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
export const registerCodeSchema = (t) =>
  yup.object().shape({
    code: yup.string().required(t("form.errors.required")),
  });
