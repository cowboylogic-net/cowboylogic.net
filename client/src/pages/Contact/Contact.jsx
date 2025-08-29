import styles from "./Contact.module.css";

import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import axios from "../../store/axios";
import { showNotification } from "../../store/slices/notificationSlice";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { contactFormSchema } from "../../validation/formSchemas";

import BaseInput from "../../components/BaseInput/BaseInput";
import BaseTextarea from "../../components/BaseTextarea/BaseTextarea";
import BaseButton from "../../components/BaseButton/BaseButton";
import FormGroup from "../../components/FormGroup/FormGroup";
import BaseForm from "../../components/BaseForm/BaseForm";

const Contact = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const schema = contactFormSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await axios.post("/contact", data);
      dispatch(showNotification({ message: t("contact.success"), type: "success" }));
      reset();
    } catch (err) {
      console.error("Contact form error:", err?.response?.data || err?.message);
      dispatch(showNotification({ message: t("contact.error"), type: "error" }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contact}>
        <h2>{t("contact.title")}</h2>
        <BaseForm className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <FormGroup label={t("contact.firstName")} error={errors.firstName?.message} required>
            <BaseInput
              type="text"
              placeholder={t("contact.firstNamePlaceholder")}
              {...register("firstName")}
              touched={touchedFields.firstName}
              error={errors.firstName?.message}
            />
          </FormGroup>

          <FormGroup label={t("contact.lastName")} error={errors.lastName?.message} required>
            <BaseInput
              type="text"
              placeholder={t("contact.lastNamePlaceholder")}
              {...register("lastName")}
              touched={touchedFields.lastName}
              error={errors.lastName?.message}
            />
          </FormGroup>

          <FormGroup label={t("contact.email")} error={errors.email?.message} required>
            <BaseInput
              type="email"
              placeholder={t("contact.emailPlaceholder")}
              {...register("email")}
              touched={touchedFields.email}
              error={errors.email?.message}
            />
          </FormGroup>

          <FormGroup label={t("contact.comment")} error={errors.message?.message} required>
            <BaseTextarea
              placeholder={t("contact.commentPlaceholder")}
              {...register("message")}
              touched={touchedFields.message}
              error={errors.message?.message}
            />
          </FormGroup>

          <BaseButton type="submit" variant="outline" disabled={isSubmitting}>
            {t("contact.submit")}
          </BaseButton>
        </BaseForm>
      </div>
    </div>
  );
};

export default Contact;
