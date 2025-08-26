import styles from "./NewsletterSignup.module.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import axios from "../../store/axios";
import { showNotification } from "../../store/slices/notificationSlice";

import { newsletterSignupSchema } from "../../validation/formSchemas";

import BaseInput from "../../components/BaseInput/BaseInput";
import BaseButton from "../../components/BaseButton/BaseButton";

const NewsletterSignup = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(newsletterSignupSchema(t)),
  });

  const onSubmit = async (data) => {
    try {
      await axios.post("/newsletter/subscribe", data);
      dispatch(showNotification({ message: t("newsletter.success"), type: "success" }));
      reset();
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
    <div className={styles.newsletter}>
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* <label htmlFor="newsletter">{t("newsletter.label")}</label> */}

        <div className={styles.inputGroup}>
          <BaseInput
            id="newsletter"
            type="email"
            size="sm"
            aria-label={t("newsletter.label")}
            placeholder={t("newsletter.placeholder")}
            {...register("email")}
            error={errors.email?.message}
          />

          <BaseButton
            className={styles.subscribeBtn}
            type="submit"
            variant="outline"
            disabled={isSubmitting}
          >
            {t("newsletter.button")}
          </BaseButton>
        </div>
      </form>
    </div>
  );
};

export default NewsletterSignup;
