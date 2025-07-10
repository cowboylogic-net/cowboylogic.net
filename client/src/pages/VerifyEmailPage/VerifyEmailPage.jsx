// src/pages/VerifyEmailPage.jsx

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerCodeSchema } from "../../validation/formSchemas";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { fetchCurrentUser } from "../../store/thunks/authThunks";
import { showNotification } from "../../store/slices/notificationSlice";
import { useSelector } from "react-redux";


import styles from "./VerifyEmailPage.module.css";
import BaseForm from "../../components/BaseForm/BaseForm";
import BaseInput from "../../components/BaseInput/BaseInput";
import BaseButton from "../../components/BaseButton/BaseButton";
import FormGroup from "../../components/FormGroup/FormGroup";
import { createApiClient } from "../../api/api";

const VerifyEmailPage = () => {
  const { t } = useTranslation("login");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const email = useSelector((state) => state.auth.emailForVerification);
  const [cooldown, setCooldown] = useState(0); // в секундах

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: yupResolver(registerCodeSchema(t)),
  });

  const onSubmit = async (data) => {
    try {
      const api = createApiClient();
      const res = await api.post("/auth/verify-code", {
        email,
        code: data.code,
      });

      const token = res?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        dispatch(fetchCurrentUser(token));
      }

      dispatch(
        showNotification({ message: t("welcomeBack"), type: "success" })
      );
      navigate("/");
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || t("codeInvalid"),
          type: "error",
        })
      );
    }
  };
  const handleResend = async () => {
    try {
      if (!email) return;
      const api = createApiClient();
      await api.post("/auth/request-code", { email });

      dispatch(showNotification({ message: t("codeResent"), type: "info" }));
      setCooldown(60); // 60 секунд блокування
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || t("resendFailed"),
          type: "error",
        })
      );
    }
  };

  if (!email) {
    return <p>{t("missingEmail")}</p>;
  }

  return (
    <div className={styles.container}>
      <h2>{t("verifyEmailTitle")}</h2>
      <p>
        {t("codeSentTo")} <strong>{email}</strong>
      </p>

      <BaseForm onSubmit={handleSubmit(onSubmit)}>
        <FormGroup
          label={t("codePlaceholder")}
          error={errors.code?.message}
          required
        >
          <BaseInput
            type="text"
            {...register("code")}
            touched={!!touchedFields.code}
          />
        </FormGroup>

        <BaseButton type="submit" variant="auth">
          {t("Verify")}
        </BaseButton>
      </BaseForm>
      <div className={styles.resendWrapper}>
        <button
          type="button"
          className={styles.resendButton}
          onClick={handleResend}
          disabled={cooldown > 0}
        >
          {cooldown > 0
            ? t("resendIn", { seconds: cooldown })
            : t("resendCode")}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
