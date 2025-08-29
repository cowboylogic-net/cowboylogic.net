import styles from "./LoginForm.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import BaseButton from "../BaseButton/BaseButton";
import BaseInput from "../BaseInput/BaseInput";
import BaseForm from "../BaseForm/BaseForm";
import api from "../../store/axios";
import { loginSuccess } from "../../store/slices/authSlice";
import { loginUser, fetchCurrentUser } from "../../store/thunks/authThunks";
import { showNotification } from "../../store/slices/notificationSlice";
import FormGroup from "../FormGroup/FormGroup";
import { loginFormSchema, codeVerificationSchema } from "../../validation/formSchemas";

const LoginForm = () => {
  const { t } = useTranslation("login");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.auth.isLoading);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
  } = useForm({
    resolver: yupResolver(step === 1 ? loginFormSchema(t) : codeVerificationSchema(t)),
    shouldFocusError: true,
  });

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onLogin = async (data) => {
    try {
      const normalizedEmail = String(data.email || "").trim().toLowerCase();
      const res = await api.post("/auth/login", { ...data, email: normalizedEmail });

      const payload = res?.data?.data ?? res?.data ?? {};
      const token = payload.token;
      const user = payload.user ?? {};

      if (token) localStorage.setItem("token", token);

      dispatch(loginSuccess({ token, user }));
      dispatch(fetchCurrentUser());
      dispatch(showNotification({ message: t("welcomeBack"), type: "success" }));
      navigate("/");
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        const normalizedEmail = String(data.email || "").trim().toLowerCase();
        setEmail(normalizedEmail);
        await api.post("/auth/request-code", { email: normalizedEmail });
        setValue("email", "");
        setValue("password", "");
        setStep(2);
        setResendCooldown(30);
        dispatch(showNotification({ message: t("codeSent"), type: "info" }));
      } else {
        dispatch(
          showNotification({
            message: err.response?.data?.message || t("loginFailed"),
            type: "error",
          })
        );
      }
    }
  };

  const onVerify = async (data) => {
    try {
      const result = await dispatch(loginUser({ email, code: data.code }));
      if (loginUser.fulfilled.match(result)) {
        const payload = result.payload ?? {};
        const token = payload.token;
        const user = payload.user ?? {};
        if (token) localStorage.setItem("token", token);
        dispatch(loginSuccess({ token, user }));
        dispatch(fetchCurrentUser());
        navigate("/");
      } else {
        dispatch(showNotification({ message: result.payload || t("codeInvalid"), type: "error" }));
      }
    } catch {
      dispatch(showNotification({ message: t("codeInvalid"), type: "error" }));
    }
  };

  const handleResendCode = async () => {
    try {
      if (!email || resendCooldown > 0) return;
      await api.post("/auth/request-code", { email });
      setResendCooldown(30);
      dispatch(showNotification({ message: t("codeResent"), type: "info" }));
    } catch {
      dispatch(showNotification({ message: t("resendFailed"), type: "error" }));
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google", { id_token: credentialResponse.credential });
      const payload = res?.data?.data ?? res?.data ?? {};
      const token = payload.token;
      const user = payload.user ?? {};

      if (!user.isEmailVerified) {
        dispatch(showNotification({ message: t("emailNotVerified"), type: "warning" }));
        return;
      }

      if (token) localStorage.setItem("token", token);
      dispatch(loginSuccess({ token, user }));
      dispatch(fetchCurrentUser());
      dispatch(showNotification({ message: t("googleSuccess"), type: "success" }));
      navigate("/");
      setStep(1);
      setEmail("");
    } catch {
      dispatch(showNotification({ message: t("googleFailed"), type: "error" }));
    }
  };

  return (
    <div className={styles.container}>
      <h2>{t("title")}</h2>

      {step === 1 ? (
        <BaseForm onSubmit={handleSubmit(onLogin)}>
          <FormGroup
            label={t("emailPlaceholder")}
            error={errors.email?.message}
            required
            forId="login-email"
          >
            <BaseInput
              id="login-email"
              type="email"
              {...register("email")}
              touched={!!touchedFields.email}
              error={errors.email?.message}
            />
          </FormGroup>

          <FormGroup
            label={t("passwordPlaceholder")}
            error={errors.password?.message}
            required
            forId="login-password"
          >
            <BaseInput
              id="login-password"
              type="password"
              {...register("password")}
              touched={!!touchedFields.password}
              error={errors.password?.message}
            />
          </FormGroup>

          <BaseButton type="submit" variant="auth" disabled={isLoading}>
            {isLoading ? t("LoggingIn") : t("continue")}
          </BaseButton>
        </BaseForm>
      ) : (
        <>
          <BaseForm onSubmit={handleSubmit(onVerify)}>
            <FormGroup
              label={t("codePlaceholder")}
              error={errors.code?.message}
              required
              forId="login-code"
            >
              <BaseInput
                id="login-code"
                type="text"
                {...register("code")}
                touched={!!touchedFields.code}
                error={errors.code?.message}
              />
            </FormGroup>

            <BaseButton type="submit" variant="auth" disabled={isLoading}>
              {isLoading ? t("LoggingIn") : t("Verify")}
            </BaseButton>
          </BaseForm>

          <div className={styles.resend}>
            <button
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              className={styles.resendButton}
            >
              {resendCooldown > 0 ? t("resendIn", { seconds: resendCooldown }) : t("resendCode")}
            </button>
          </div>
        </>
      )}

      <div className={styles["google-login"]}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() =>
            dispatch(showNotification({ message: t("googleFailed"), type: "error" }))
          }
        />
      </div>
    </div>
  );
};

export default LoginForm;
