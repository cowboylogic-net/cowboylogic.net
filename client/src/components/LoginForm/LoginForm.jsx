import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";

import styles from "./LoginForm.module.css";
import axios from "../../store/axios";
import { loginUser } from "../../store/thunks/authThunks";         // ✅ виправлено
import { fetchCurrentUser } from "../../store/thunks/authThunks"; // вже правильно


import { showNotification } from "../../store/slices/notificationSlice";

// ✅ Схема валідації для кроку 1
const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password too short").required("Password is required"),
});

// ✅ Схема валідації для кроку 2
const codeSchema = yup.object().shape({
  code: yup.string().required("Verification code required"),
});

const LoginForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.auth.isLoading);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(step === 1 ? loginSchema : codeSchema),
  });

  const onLogin = async (data) => {
    try {
      await axios.post("/auth/login", data);
      await axios.post("/auth/request-code", { email: data.email });

      setEmail(data.email);

      // Очищуємо email і password при переході на step 2
      setValue("email", "");
      setValue("password", "");

      setStep(2);
      dispatch(showNotification({ message: t("login.codeSent"), type: "info" }));
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || t("login.loginFailed"),
          type: "error",
        })
      );
    }
  };

  const onVerify = async (data) => {
    try {
      const result = await dispatch(loginUser({ email, code: data.code }));
      if (loginUser.fulfilled.match(result)) {
        dispatch(showNotification({ message: t("login.welcomeBack"), type: "success" }));
        dispatch(fetchCurrentUser(result.payload.token));
        navigate("/");
      } else {
        dispatch(
          showNotification({
            message: result.payload || t("login.codeInvalid"),
            type: "error",
          })
        );
      }
    } catch {
      dispatch(showNotification({ message: t("login.codeInvalid"), type: "error" }));
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post("/auth/google", {
        id_token: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      dispatch(fetchCurrentUser(res.data.token));
      dispatch(showNotification({ message: t("login.googleSuccess"), type: "success" }));
      navigate("/");
    } catch {
      dispatch(showNotification({ message: t("login.googleFailed"), type: "error" }));
    }
  };

  return (
    <div className={styles.container}>
      <h2>{t("Login")}</h2>

      {step === 1 ? (
        <form onSubmit={handleSubmit(onLogin)}>
          <input type="email" placeholder={t("Email")} {...register("email")} />
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}

          <input type="password" placeholder={t("Password")} {...register("password")} />
          {errors.password && <p className={styles.error}>{errors.password.message}</p>}

          <button type="submit">{t("Continue")}</button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onVerify)}>
          <input type="text" placeholder={t("Placeholder")} {...register("code")} />
          {errors.code && <p className={styles.error}>{errors.code.message}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? t("LoggingIn") : t("Verify")}
          </button>
        </form>
      )}

      <div className={styles["google-login"]}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() =>
            dispatch(showNotification({ message: t("login.googleFailed"), type: "error" }))
          }
        />
      </div>
    </div>
  );
};

export default LoginForm;

