import styles from "./RegisterForm.module.css";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerFormSchema, registerCodeSchema } from "../../validation/formSchemas";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";


import axios from "../../store/axios";
import { fetchCurrentUser } from "../../store/thunks/authThunks";
import { showNotification } from "../../store/slices/notificationSlice";

import BaseInput from "../BaseInput/BaseInput";
import BaseButton from "../BaseButton/BaseButton";
import BaseForm from "../BaseForm/BaseForm";
import FormGroup from "../FormGroup/FormGroup";


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
    resolver: yupResolver(step === 1 ? registerFormSchema(t) : registerCodeSchema(t)),
  });

  const onRegister = async (form) => {
    try {
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
        <FormGroup
          label={t("email")}
          error={errors.email?.message}
          required
        >
          <BaseInput
            type="email"
            {...register("email")}
            touched={!!touchedFields.email}
          />
        </FormGroup>

        <FormGroup
          label={t("password")}
          error={errors.password?.message}
          required
        >
          <BaseInput
            type="password"
            {...register("password")}
            touched={!!touchedFields.password}
          />
        </FormGroup>

        <BaseButton type="submit" variant="auth">
          {t("Register")}
        </BaseButton>
      </BaseForm>
    ) : (
      <BaseForm onSubmit={handleSubmit(onVerifyCode)}>
        <p>
          {t("codeSentTo")} {email}
        </p>

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
