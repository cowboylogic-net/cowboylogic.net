import styles from "./ResetPasswordForm.module.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import axios from "../../store/axios";
import { useTranslation } from "react-i18next";
import BaseButton from "../BaseButton/BaseButton";
import BaseInput from "../BaseInput/BaseInput";
import BaseForm from "../BaseForm/BaseForm";
import FormGroup from "../FormGroup/FormGroup";


const schema = yup.object().shape({
  oldPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(6, "New password must be at least 6 characters")
    .required("New password is required"),
});

const ResetPasswordForm = ({ onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleResetPassword = async (data) => {
    try {
      await axios.patch("/auth/reset-password", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(
        showNotification({
          message: t("resetPassword.success"),
          type: "success",
        })
      );

      setTimeout(() => dispatch(logout()), 2000);
      reset();
      if (onSuccess) onSuccess(); // ✅ Закриває модалку
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || t("resetPassword.error"),
          type: "error",
        })
      );
    }
  };

  return (
    <div className={styles.container}>
      <BaseForm onSubmit={handleSubmit(handleResetPassword)}>
        <FormGroup
          label={t("resetPassword.currentLabel")}
          error={errors.oldPassword?.message}
        >
          <BaseInput
            type="password"
            placeholder={t("resetPassword.currentPlaceholder")}
            {...register("oldPassword")}
          />
        </FormGroup>

        <FormGroup
          label={t("resetPassword.newLabel")}
          error={errors.newPassword?.message}
        >
          <BaseInput
            type="password"
            placeholder={t("resetPassword.newPlaceholder")}
            {...register("newPassword")}
          />
        </FormGroup>

        <BaseButton type="submit" variant="auth">
          {t("resetPassword.button")}
        </BaseButton>
      </BaseForm>
    </div>
  );
};

export default ResetPasswordForm;
