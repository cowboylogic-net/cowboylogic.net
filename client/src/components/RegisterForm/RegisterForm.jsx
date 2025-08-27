import styles from "./RegisterForm.module.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerFormSchema } from "../../validation/formSchemas";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import api from "../../store/axios";
import { showNotification } from "../../store/slices/notificationSlice";
import { setEmailForVerification } from "../../store/slices/authSlice";
import { fetchCurrentUser } from "../../store/thunks/authThunks";

import BaseInput from "../BaseInput/BaseInput";
import BaseButton from "../BaseButton/BaseButton";
import BaseForm from "../BaseForm/BaseForm";
import FormGroup from "../FormGroup/FormGroup";
import BaseCheckbox from "../BaseCheckbox/BaseCheckbox";

const RegisterForm = () => {
  const { t } = useTranslation("login");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
  } = useForm({
    resolver: yupResolver(registerFormSchema(t)),
    defaultValues: {
      isPartner: false,
      termsAgreed: false,
      newsletter: false,
    },
    shouldFocusError: true,
  });

  const isPartner = watch("isPartner");
  const termsAgreed = watch("termsAgreed");

  const onRegister = async (form) => {
    try {
      form.email = String(form.email || "").trim().toLowerCase();
      if (form.phoneNumber) form.phoneNumber = String(form.phoneNumber).trim();

      form.role = isPartner ? "partner" : "user";

      if (termsAgreed) {
        form.gdprConsentAt = new Date().toISOString();
      } else {
        delete form.gdprConsentAt;
      }

      delete form.isPartner;

      if (!isPartner) {
        delete form.partnerProfile;
      } else if (form.partnerProfile) {
        if (!form.partnerProfile.businessWebsite) {
          delete form.partnerProfile.businessWebsite;
        }
        if (!form.partnerProfile.contactPhone) {
          delete form.partnerProfile.contactPhone;
        }
      }

      const response = await api.post("/auth/register", form);

      dispatch(showNotification({ message: t("registered"), type: "success" }));
      const payload = response?.data?.data ?? response?.data ?? {};
      const user = payload.user ?? payload;

      if (!user.isEmailVerified) {
        dispatch(showNotification({ message: t("codeSent"), type: "info" }));
        dispatch(setEmailForVerification(user.email));
        navigate("/verify-email");
      } else {
        const loginRes = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        const loginPayload = loginRes?.data?.data ?? loginRes?.data ?? {};
        const token = loginPayload.token;
        if (token) {
          localStorage.setItem("token", token);
          dispatch(fetchCurrentUser());
        }
        navigate("/dashboard");
      }
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
      const res = await api.post("/auth/google", {
        id_token: credentialResponse.credential,
      });

      const payload = res?.data?.data ?? res?.data ?? {};
      if (payload.token) {
        localStorage.setItem("token", payload.token);
        dispatch(fetchCurrentUser());
      }
      dispatch(showNotification({ message: t("googleSuccess"), type: "success" }));
      navigate("/");
    } catch {
      dispatch(showNotification({ message: t("googleFailed"), type: "error" }));
    }
  };

  return (
    <div className={styles.container}>
      <h2>{t("registerTitle")}</h2>

      <BaseForm onSubmit={handleSubmit(onRegister)}>
        <FormGroup label={t("fullName")} error={errors.fullName?.message} required>
          <BaseInput {...register("fullName")} touched={!!touchedFields.fullName} />
        </FormGroup>

        <FormGroup label={t("email")} error={errors.email?.message} required>
          <BaseInput type="email" {...register("email")} touched={!!touchedFields.email} />
        </FormGroup>

        <FormGroup label={t("password")} error={errors.password?.message} required>
          <BaseInput type="password" {...register("password")} touched={!!touchedFields.password} />
        </FormGroup>

        <FormGroup label={t("repeatPassword")} error={errors.repeatPassword?.message} required>
          <BaseInput type="password" {...register("repeatPassword")} touched={!!touchedFields.repeatPassword} />
        </FormGroup>

        <FormGroup label={t("phoneNumber")} error={errors.phoneNumber?.message}>
          <BaseInput type="tel" {...register("phoneNumber")} touched={!!touchedFields.phoneNumber} />
        </FormGroup>

        <FormGroup label={t("heardAboutUs")} error={errors.heardAboutUs?.message}>
          <BaseInput {...register("heardAboutUs")} touched={!!touchedFields.heardAboutUs} />
        </FormGroup>

        <FormGroup>
          <BaseCheckbox {...register("newsletter")} label={t("registerForm.newsletter")} />
        </FormGroup>

        <FormGroup>
          <BaseCheckbox {...register("isPartner")} label={t("registerForm.isPartner")} />
        </FormGroup>

        {isPartner && (
          <>
            <FormGroup
              label={t("registerForm.organizationName")}
              error={errors.partnerProfile?.organizationName?.message}
            >
              <BaseInput
                {...register("partnerProfile.organizationName")}
                touched={!!touchedFields.partnerProfile?.organizationName}
              />
            </FormGroup>

            <FormGroup
              label={t("registerForm.businessType")}
              error={errors.partnerProfile?.businessType?.message}
            >
              <BaseInput
                {...register("partnerProfile.businessType")}
                touched={!!touchedFields.partnerProfile?.businessType}
              />
            </FormGroup>

            <FormGroup label={t("registerForm.address")}>
              <BaseInput {...register("partnerProfile.address")} />
            </FormGroup>

            <FormGroup label={t("registerForm.city")}>
              <BaseInput {...register("partnerProfile.city")} />
            </FormGroup>

            <FormGroup label={t("registerForm.country")}>
              <BaseInput {...register("partnerProfile.country")} />
            </FormGroup>

            <FormGroup
              label={t("registerForm.contactPhone")}
              error={errors.partnerProfile?.contactPhone?.message}
            >
              <BaseInput
                {...register("partnerProfile.contactPhone")}
                touched={!!touchedFields.partnerProfile?.contactPhone}
              />
            </FormGroup>

            <FormGroup
              label={t("registerForm.businessWebsite")}
              error={errors.partnerProfile?.businessWebsite?.message}
            >
              <BaseInput
                {...register("partnerProfile.businessWebsite")}
                touched={!!touchedFields.partnerProfile?.businessWebsite}
              />
            </FormGroup>
          </>
        )}

        <FormGroup>
          <BaseCheckbox {...register("termsAgreed")} label={t("registerForm.terms")} />
          {errors.termsAgreed && <p className={styles.error}>{errors.termsAgreed.message}</p>}
        </FormGroup>

        <BaseButton type="submit" variant="auth">
          {t("Register")}
        </BaseButton>
      </BaseForm>

      <div className={styles.googleSignup}>
        <GoogleLogin
          onSuccess={handleGoogleSignup}
          onError={() => dispatch(showNotification({ message: t("googleFailed"), type: "error" }))}
        />
      </div>
    </div>
  );
};

export default RegisterForm;
