import { useDispatch } from "react-redux";
import { apiService } from "../../services/axiosService";
import { showNotification } from "../../store/slices/notificationSlice"; // ✅
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styles from "./Newsletter.module.css";

const Newsletter = () => {
  const dispatch = useDispatch();

  const schema = yup.object().shape({
    subject: yup
      .string()
      .trim()
      .min(3, "Subject is too short")
      .required("Subject is required"),
    content: yup
      .string()
      .trim()
      .min(10, "Content is too short")
      .required("Content is required"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await apiService.post("/newsletter/send", data, true);
      reset();
      dispatch(
        showNotification({
          message: "✅ Newsletter sent successfully",
          type: "success",
        })
      );
      reset();
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || "❌ Sending failed",
          type: "error",
        })
      );
    }
  };

  return (
    <div className={styles.container}>
      <h2>Send Newsletter</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <label>
          Subject:
          <input type="text" {...register("subject")} />
          {errors.subject && (
            <p className={styles.error}>{errors.subject.message}</p>
          )}
        </label>

        <label>
          Content (HTML allowed):
          <textarea rows={10} {...register("content")} />
          {errors.content && (
            <p className={styles.error}>{errors.content.message}</p>
          )}
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Newsletter"}
        </button>
      </form>
    </div>
  );
};

export default Newsletter;
