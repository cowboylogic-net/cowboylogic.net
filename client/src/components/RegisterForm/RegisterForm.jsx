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

  const onRegister = async (form) => {
    try {
      form.email = String(form.email || "")
        .trim()
        .toLowerCase();
      if (form.phoneNumber) form.phoneNumber = String(form.phoneNumber).trim();

      form.role = isPartner ? "partner" : "user";
      delete form.gdprConsentAt;
      delete form.isPartner;

      if (!isPartner) {
        delete form.partnerProfile;
      } else if (form.partnerProfile) {
        if (!form.partnerProfile.businessWebsite)
          delete form.partnerProfile.businessWebsite;
        if (!form.partnerProfile.contactPhone)
          delete form.partnerProfile.contactPhone;
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
        dispatch(fetchCurrentUser());
      }
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

      <BaseForm onSubmit={handleSubmit(onRegister)}>
        <FormGroup
          label={t("fullName")}
          error={errors.fullName?.message}
          required
          forId="reg-fullName"
        >
          <BaseInput
            id="reg-fullName"
            {...register("fullName")}
            touched={!!touchedFields.fullName}
            error={errors.fullName?.message}
          />
        </FormGroup>

        <FormGroup
          label={t("email")}
          error={errors.email?.message}
          required
          forId="reg-email"
        >
          <BaseInput
            id="reg-email"
            type="email"
            {...register("email")}
            touched={!!touchedFields.email}
            error={errors.email?.message}
          />
        </FormGroup>

        <FormGroup
          label={t("password")}
          error={errors.password?.message}
          required
          forId="reg-pass"
        >
          <BaseInput
            id="reg-pass"
            type="password"
            {...register("password")}
            touched={!!touchedFields.password}
            error={errors.password?.message}
          />
        </FormGroup>

        <FormGroup
          label={t("repeatPassword")}
          error={errors.repeatPassword?.message}
          required
          forId="reg-pass2"
        >
          <BaseInput
            id="reg-pass2"
            type="password"
            {...register("repeatPassword")}
            touched={!!touchedFields.repeatPassword}
            error={errors.repeatPassword?.message}
          />
        </FormGroup>

        <FormGroup
          label={t("phoneNumber")}
          error={errors.phoneNumber?.message}
          forId="reg-phone"
        >
          <BaseInput
            id="reg-phone"
            type="tel"
            {...register("phoneNumber")}
            touched={!!touchedFields.phoneNumber}
            error={errors.phoneNumber?.message}
          />
        </FormGroup>

        <FormGroup
          label={t("heardAboutUs")}
          error={errors.heardAboutUs?.message}
          forId="reg-how"
        >
          <BaseInput
            id="reg-how"
            {...register("heardAboutUs")}
            touched={!!touchedFields.heardAboutUs}
            error={errors.heardAboutUs?.message}
          />
        </FormGroup>

        <FormGroup>
          <BaseCheckbox
            {...register("newsletter")}
            label={t("registerForm.newsletter")}
          />
        </FormGroup>

        <FormGroup>
          <BaseCheckbox
            {...register("isPartner")}
            label={t("registerForm.isPartner")}
          />
        </FormGroup>

        {isPartner && (
          <>
            <FormGroup
              label={t("registerForm.organizationName")}
              error={errors.partnerProfile?.organizationName?.message}
              forId="reg-orgName"
            >
              <BaseInput
                id="reg-orgName"
                {...register("partnerProfile.organizationName")}
                touched={!!touchedFields.partnerProfile?.organizationName}
                error={errors.partnerProfile?.organizationName?.message}
              />
            </FormGroup>

            <FormGroup
              label={t("registerForm.businessType")}
              error={errors.partnerProfile?.businessType?.message}
              forId="reg-bType"
            >
              <BaseInput
                id="reg-bType"
                {...register("partnerProfile.businessType")}
                touched={!!touchedFields.partnerProfile?.businessType}
                error={errors.partnerProfile?.businessType?.message}
              />
            </FormGroup>

            <FormGroup label={t("registerForm.address")} forId="reg-address">
              <BaseInput
                id="reg-address"
                {...register("partnerProfile.address")}
              />
            </FormGroup>

            <FormGroup label={t("registerForm.city")} forId="reg-city">
              <BaseInput id="reg-city" {...register("partnerProfile.city")} />
            </FormGroup>

            <FormGroup label={t("registerForm.country")} forId="reg-country">
              <BaseInput
                id="reg-country"
                {...register("partnerProfile.country")}
              />
            </FormGroup>

            <FormGroup
              label={t("registerForm.contactPhone")}
              error={errors.partnerProfile?.contactPhone?.message}
              forId="reg-contactPhone"
            >
              <BaseInput
                id="reg-contactPhone"
                {...register("partnerProfile.contactPhone")}
                touched={!!touchedFields.partnerProfile?.contactPhone}
                error={errors.partnerProfile?.contactPhone?.message}
              />
            </FormGroup>

            <FormGroup
              label={t("registerForm.businessWebsite")}
              error={errors.partnerProfile?.businessWebsite?.message}
              forId="reg-website"
            >
              <BaseInput
                id="reg-website"
                {...register("partnerProfile.businessWebsite")}
                touched={!!touchedFields.partnerProfile?.businessWebsite}
                error={errors.partnerProfile?.businessWebsite?.message}
              />
            </FormGroup>
          </>
        )}

        <FormGroup>
          <BaseCheckbox
            {...register("termsAgreed")}
            label={t("registerForm.terms")}
          />
          {errors.termsAgreed && (
            <p className={styles.error}>{errors.termsAgreed.message}</p>
          )}
        </FormGroup>

        <BaseButton type="submit" variant="auth">
          {t("Register")}
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
