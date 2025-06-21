import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import BaseButton from "../BaseButton/BaseButton";
import BaseInput from "../BaseInput/BaseInput";
import BaseForm from "../BaseForm/BaseForm";

import styles from "./LoginForm.module.css";
import axios from "../../store/axios";
import { loginUser, fetchCurrentUser } from "../../store/thunks/authThunks";
import { showNotification } from "../../store/slices/notificationSlice";

// ✅ Валідація
const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password too short")
    .required("Password is required"),
});

const codeSchema = yup.object().shape({
  code: yup.string().required("Verification code required"),
});

const LoginForm = () => {
  const { t } = useTranslation("login");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.auth.isLoading);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
  } = useForm({
    resolver: yupResolver(step === 1 ? loginSchema : codeSchema),
  });

  const onLogin = async (data) => {
    try {
      await axios.post("/auth/login", data);
      await axios.post("/auth/request-code", { email: data.email });

      setEmail(data.email);
      setValue("email", "");
      setValue("password", "");
      setStep(2);

      dispatch(showNotification({ message: t("codeSent"), type: "info" }));
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || t("loginFailed"),
          type: "error",
        })
      );
    }
  };

  const onVerify = async (data) => {
    try {
      const result = await dispatch(loginUser({ email, code: data.code }));
      if (loginUser.fulfilled.match(result)) {
        dispatch(
          showNotification({ message: t("welcomeBack"), type: "success" })
        );
        dispatch(fetchCurrentUser(result.payload.token));
        navigate("/");
      } else {
        dispatch(
          showNotification({
            message: result.payload || t("codeInvalid"),
            type: "error",
          })
        );
      }
    } catch {
      dispatch(showNotification({ message: t("codeInvalid"), type: "error" }));
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post("/auth/google", {
        id_token: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      dispatch(fetchCurrentUser(res.data.token));
      dispatch(
        showNotification({ message: t("googleSuccess"), type: "success" })
      );
      navigate("/");
    } catch {
      dispatch(showNotification({ message: t("googleFailed"), type: "error" }));
    }
  };

  return (
    <div className={styles.container}>
      <h2>{t("title")}</h2>

      {step === 1 ? (
        <BaseForm onSubmit={handleSubmit(onLogin)}>
          <BaseInput
            type="email"
            placeholder={t("emailPlaceholder")}
            {...register("email")}
            error={errors.email?.message}
            touched={!!touchedFields.email}
            required
          />

          <BaseInput
            type="password"
            placeholder={t("passwordPlaceholder")}
            {...register("password")}
            error={errors.password?.message}
            touched={!!touchedFields.password}
            required
          />

          <BaseButton type="submit" variant="auth">
            {t("continue")}
          </BaseButton>
        </BaseForm>
      ) : (
        <BaseForm onSubmit={handleSubmit(onVerify)}>
          <BaseInput
            type="text"
            label={t("codePlaceholder")}
            placeholder={t("codePlaceholder")}
            {...register("code")}
            error={errors.code?.message}
            touched={!!touchedFields.code}
            required
          />

          <BaseButton type="submit" variant="auth" disabled={isLoading}>
            {isLoading ? t("LoggingIn") : t("Verify")}
          </BaseButton>
        </BaseForm>
      )}

      <div className={styles["google-login"]}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() =>
            dispatch(
              showNotification({ message: t("googleFailed"), type: "error" })
            )
          }
        />
      </div>
    </div>
  );
};

export default LoginForm;
