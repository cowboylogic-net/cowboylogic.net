import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";

import styles from "./RegisterForm.module.css";
import axios from "../../store/axios";
import { fetchCurrentUser } from "../../store/thunks/authThunks";
import { showNotification } from "../../store/slices/notificationSlice";

import BaseInput from "../BaseInput/BaseInput";
import BaseButton from "../BaseButton/BaseButton";
import BaseForm from "../BaseForm/BaseForm";

const registerSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const codeSchema = yup.object().shape({
  code: yup.string().required("Verification code required"),
});

const RegisterForm = () => {
  const { t } = useTranslation("login");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
  } = useForm({
    resolver: yupResolver(step === 1 ? registerSchema : codeSchema),
  });

  const onRegister = async (form) => {
    try {
      // await axios.post("/auth/register", form);
      // dispatch(showNotification({ message: t("registered"), type: "success" }));

      // await axios.post("/auth/login", form);

      // await axios.post("/auth/request-code", { email: form.email });
      await axios.post("/auth/register", form);
      dispatch(showNotification({ message: t("registered"), type: "success" }));
      console.log("✅ Registered");

      await axios.post("/auth/login", form);
      console.log("✅ Logged in");

      console.log("📨 Sending verification code to:", form.email);
      await axios.post("/auth/request-code", { email: form.email });

      setEmail(form.email);
      setValue("email", "");
      setValue("password", "");
      setStep(2);
      dispatch(showNotification({ message: t("codeSent"), type: "info" }));
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || t("registerFailed"),
          type: "error",
        })
      );
    }
  };

  const onVerifyCode = async (form) => {
    try {
      const res = await axios.post("/auth/verify-code", {
        email,
        code: form.code,
      });

      localStorage.setItem("token", res.data.token);
      dispatch(fetchCurrentUser(res.data.token));
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

  const handleGoogleSignup = async (credentialResponse) => {
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
      <h2>{t("registerTitle")}</h2>

      {step === 1 ? (
        <BaseForm onSubmit={handleSubmit(onRegister)}>
          <BaseInput
            type="email"
            placeholder={t("email")}
            {...register("email")}
            error={errors.email?.message}
            touched={!!touchedFields.email}
            required
          />
          <BaseInput
            type="password"
            placeholder={t("password")}
            {...register("password")}
            error={errors.password?.message}
            touched={!!touchedFields.password}
            required
          />
          <BaseButton type="submit" variant="auth">
            {t("Register")}
          </BaseButton>
        </BaseForm>
      ) : (
        <BaseForm onSubmit={handleSubmit(onVerifyCode)}>
          <p>
            {t("codeSentTo")} {email}
          </p>

          <BaseInput
            type="text"
            placeholder={t("codePlaceholder")}
            {...register("code")}
            error={errors.code?.message}
            touched={!!touchedFields.code}
            required
          />
          <BaseButton type="submit" variant="auth">
            {t("Verify")}
          </BaseButton>
        </BaseForm>
      )}

      <div className={styles.googleSignup}>
        <GoogleLogin
          onSuccess={handleGoogleSignup}
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

export default RegisterForm;
