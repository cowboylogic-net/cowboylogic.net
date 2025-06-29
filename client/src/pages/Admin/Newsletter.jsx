import styles from "./Newsletter.module.css";

import { useDispatch } from "react-redux";
import { apiService } from "../../services/axiosService";
import { showNotification } from "../../store/slices/notificationSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";

import BaseButton from "../../components/BaseButton/BaseButton";
import BaseInput from "../../components/BaseInput/BaseInput";
import BaseTextarea from "../../components/BaseTextarea/BaseTextarea";
import { newsletterFormSchema } from "../../validation/formSchemas";
import FormGroup from "../../components/FormGroup/FormGroup"; // ✅ додано

const Newsletter = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const schema = newsletterFormSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await apiService.post("/newsletter/send", data, true);
      reset();
      dispatch(
        showNotification({
          message: t("newsletter.success"),
          type: "success",
        })
      );
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || t("newsletter.error"),
          type: "error",
        })
      );
    }
  };

  return (
    <div className={styles.newsletterContainer}>
      <h2>{t("admin.sendNewsletter")}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormGroup
          label={t("newsletter.subject")}
          error={errors.subject?.message}
          required
        >
          <BaseInput
            type="text"
            placeholder={t("newsletter.subjectPlaceholder")}
            {...register("subject")}
            touched={touchedFields.subject}
          />
        </FormGroup>

        <FormGroup
          label={t("newsletter.content")}
          error={errors.content?.message}
          required
        >
          <BaseTextarea
            rows={10}
            placeholder={t("newsletter.contentPlaceholder")}
            {...register("content")}
            touched={touchedFields.content}
          />
        </FormGroup>

        <BaseButton type="submit" disabled={isSubmitting} variant="outline">
          {isSubmitting ? t("newsletter.sending") : t("newsletter.submit")}
        </BaseButton>
      </form>
    </div>
  );
};

export default Newsletter;
