import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import styles from "./ResetPasswordForm.module.css";
import axios from "../../store/axios";

// ✅ Yup schema
const schema = yup.object().shape({
  oldPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(6, "New password must be at least 6 characters")
    .required("New password is required"),
});

const ResetPasswordForm = () => {
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

  const onSubmit = async (data) => {
    try {
      await axios.patch("/auth/reset-password", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(
        showNotification({
          message: "✅ Password updated and confirmation email sent. Logging out...",
          type: "success",
        })
      );

      setTimeout(() => dispatch(logout()), 2000);
      reset();
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || "❌ Error updating password",
          type: "error",
        })
      );
    }
  };

  return (
    <div className={styles.container}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="password"
          placeholder="Current Password"
          {...register("oldPassword")}
        />
        {errors.oldPassword && (
          <p className={styles.error}>{errors.oldPassword.message}</p>
        )}

        <input
          type="password"
          placeholder="New Password"
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className={styles.error}>{errors.newPassword.message}</p>
        )}

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
