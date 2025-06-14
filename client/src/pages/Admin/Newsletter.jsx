import { useDispatch } from "react-redux";
import { apiService } from "../../services/axiosService";
import { showNotification } from "../../store/slices/notificationSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styles from "./Newsletter.module.css";
import { useTranslation } from "react-i18next";

const Newsletter = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const schema = yup.object().shape({
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
    <div className={styles.container}>
      <h2>{t("admin.sendNewsletter")}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <label>
          {t("newsletter.subject")}:
          <input
            type="text"
            placeholder={t("newsletter.subjectPlaceholder")}
            {...register("subject")}
          />
          {errors.subject && (
            <p className={styles.error}>{errors.subject.message}</p>
          )}
        </label>

        <label>
          {t("newsletter.content")}:
          <textarea
            rows={10}
            placeholder={t("newsletter.contentPlaceholder")}
            {...register("content")}
          />
          {errors.content && (
            <p className={styles.error}>{errors.content.message}</p>
          )}
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("newsletter.sending") : t("newsletter.submit")}
        </button>
      </form>
    </div>
  );
};

export default Newsletter;
