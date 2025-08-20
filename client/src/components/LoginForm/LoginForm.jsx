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
import axios from "../../store/axios";
// import { loginSuccess } from "../../store/slices/authSlice";

import { loginUser, fetchCurrentUser } from "../../store/thunks/authThunks";
import { showNotification } from "../../store/slices/notificationSlice";
import FormGroup from "../FormGroup/FormGroup";
import {
  loginFormSchema,
  codeVerificationSchema,
} from "../../validation/formSchemas";

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
    resolver: yupResolver(
      step === 1 ? loginFormSchema(t) : codeVerificationSchema(t)
    ),
  });

  // 🔁 Countdown для resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

//   const onLogin = async (data) => {
//   try {
//     const res = await axios.post("/auth/login", data);
//     const { token, user } = res.data;

//     if (token && user) {
//       dispatch(loginSuccess({ token, user }));       
//       localStorage.setItem("token", token);           
//       dispatch(fetchCurrentUser());                   
//       dispatch(
//         showNotification({ message: t("welcomeBack"), type: "success" })
//       );
//       navigate("/");                                  
//     } else {
//       throw new Error("Invalid login response");
//     }
//   } catch (err) {
//     const status = err.response?.status;

//     if (status === 403) {
      
//       setEmail(data.email);
//       await axios.post("/auth/request-code", { email: data.email });
//       setValue("email", "");
//       setValue("password", "");
//       setStep(2);
//       setResendCooldown(30);
//       dispatch(showNotification({ message: t("codeSent"), type: "info" }));
//       return;
//     }

//     dispatch(
//       showNotification({
//         message: err.response?.data?.message || t("loginFailed"),
//         type: "error",
//       })
//     );
//   }
// };

const onLogin = async (data) => {
  try {
    const res = await axios.post("/auth/login", data);
    const { token } = res.data.data;

    // Якщо користувач верифікований — логін успішний
    localStorage.setItem("token", token);
    dispatch(fetchCurrentUser());
    dispatch(showNotification({ message: t("welcomeBack"), type: "success" }));
    navigate("/");
  } catch (err) {
    const status = err.response?.status;

    // Якщо email ще не верифікований → вмикаємо step 2
    if (status === 403) {
      setEmail(data.email);
      await axios.post("/auth/request-code", { email: data.email });
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


  // const onVerify = async (data) => {
  //   try {
  //     const result = await dispatch(loginUser({ email, code: data.code }));
  //     if (loginUser.fulfilled.match(result)) {
  //       dispatch(
  //         showNotification({ message: t("welcomeBack"), type: "success" })
  //       );
  //       dispatch(fetchCurrentUser(result.payload.token));
  //       navigate("/");
  //     } else {
  //       dispatch(
  //         showNotification({
  //           message: result.payload || t("codeInvalid"),
  //           type: "error",
  //         })
  //       );
  //     }
  //   } catch {
  //     dispatch(showNotification({ message: t("codeInvalid"), type: "error" }));
  //   }
  // };

  const onVerify = async (data) => {
  try {
    const result = await dispatch(loginUser({ email, code: data.code }));

    if (loginUser.fulfilled.match(result)) {
      dispatch(fetchCurrentUser());
      dispatch(showNotification({ message: t("welcomeBack"), type: "success" }));
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


  const handleResendCode = async () => {
    try {
      await axios.post("/auth/request-code", { email });
      setResendCooldown(30);
      dispatch(showNotification({ message: t("codeResent"), type: "info" }));
    } catch {
      dispatch(showNotification({ message: t("resendFailed"), type: "error" }));
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post("/auth/google", {
        id_token: credentialResponse.credential,
      });

      // const { token, user } = res.data;
      const { token, user } = res.data.data;

      if (!user.isEmailVerified) {
        dispatch(
          showNotification({
            message: t("emailNotVerified"),
            type: "warning",
          })
        );
        return; // 🛑 не логінимо
      }

      localStorage.setItem("token", token);
      dispatch(fetchCurrentUser(token));
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
          <FormGroup
            label={t("emailPlaceholder")}
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
            label={t("passwordPlaceholder")}
            error={errors.password?.message}
            required
          >
            <BaseInput
              type="password"
              {...register("password")}
              touched={!!touchedFields.password}
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
            >
              <BaseInput
                type="text"
                {...register("code")}
                touched={!!touchedFields.code}
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
              {resendCooldown > 0
                ? t("resendIn", { seconds: resendCooldown })
                : t("resendCode")}
            </button>
          </div>
        </>
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
