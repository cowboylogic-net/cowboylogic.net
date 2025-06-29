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


// NewsletterForm schema
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
