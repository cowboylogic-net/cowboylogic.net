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

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const RegisterForm = () => {
  const { t } = useTranslation("login");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (form) => {
    try {
      await axios.post("/auth/register", form);
      dispatch(showNotification({ message: t("registered"), type: "success" }));

      await axios.post("/auth/login", form);
      await axios.post("/auth/request-code", { email: form.email });

      const code = prompt(t("codePlaceholder"));
      const verifyRes = await axios.post("/auth/verify-code", {
        email: form.email,
        code,
      });

      localStorage.setItem("token", verifyRes.data.token);
      dispatch(fetchCurrentUser(verifyRes.data.token));
      dispatch(
        showNotification({ message: t("welcomeBack"), type: "success" })
      );
      navigate("/");
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || t("registerFailed"),
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
      <BaseForm onSubmit={handleSubmit(onSubmit)}>
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
        <BaseButton type="submit" variant="auth" disabled={isSubmitting}>
          {isSubmitting ? t("Registering") : t("Register")}
        </BaseButton>
      </BaseForm>

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
