import styles from "./ResetPasswordForm.module.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "../../store/slices/notificationSlice";
import { logoutUser } from "../../store/thunks/authThunks";
import axios from "../../store/axios";
import { useTranslation } from "react-i18next";
import BaseButton from "../BaseButton/BaseButton";
import BaseInput from "../BaseInput/BaseInput";
import BaseForm from "../BaseForm/BaseForm";
import FormGroup from "../FormGroup/FormGroup";

const schema = (t) =>
  yup.object().shape({
    oldPassword: yup
      .string()
      .required(t("resetPassword.errors.currentRequired")),
    newPassword: yup
      .string()
      .min(6, t("resetPassword.errors.newMin"))
      .required(t("resetPassword.errors.newRequired")),
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
    resolver: yupResolver(schema(t)), 
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

      setTimeout(() => dispatch(logoutUser()), 2000);
      reset();
      if (onSuccess) onSuccess();
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
