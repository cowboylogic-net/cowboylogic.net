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

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const RegisterForm = () => {
  const { t } = useTranslation("login");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

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
      dispatch(showNotification({ message: t("welcomeBack"), type: "success" }));
      navigate("/");
    } catch (err) {
      dispatch(showNotification({
        message: err.response?.data?.message || t("registerFailed"),
        type: "error",
      }));
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const res = await axios.post("/auth/google", {
        id_token: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      dispatch(fetchCurrentUser(res.data.token));

      dispatch(showNotification({ message: t("googleSuccess"), type: "success" }));
      navigate("/");
    } catch {
      dispatch(showNotification({ message: t("googleFailed"), type: "error" }));
    }
  };

  return (
    <div className={styles.container}>
      <h2>{t("registerTitle")}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder={t("email")}
          {...register("email")}
        />
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}

        <input
          type="password"
          placeholder={t("password")}
          {...register("password")}
        />
        {errors.password && <p className={styles.error}>{errors.password.message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("registering") : t("register")}
        </button>
      </form>

      <div className={styles["google-signup"]}>
        <GoogleLogin
          onSuccess={handleGoogleSignup}
          onError={() =>
            dispatch(showNotification({ message: t("googleFailed"), type: "error" }))
          }
        />
      </div>
    </div>
  );
};

export default RegisterForm;
