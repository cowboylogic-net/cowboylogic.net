import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { GoogleLogin } from "@react-oauth/google";

import styles from "./RegisterForm.module.css";
import axios from "../../store/axios";
import { fetchCurrentUser } from "../../store/slices/authSlice";
import { showNotification } from "../../store/slices/notificationSlice";

// 🔒 Yup валідація
const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const RegisterForm = () => {
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
      dispatch(showNotification({ message: "Account created successfully!", type: "success" }));

      await axios.post("/auth/login", form);
      await axios.post("/auth/request-code", { email: form.email });

      const code = prompt("Enter the verification code sent to email:");
      const verifyRes = await axios.post("/auth/verify-code", {
        email: form.email,
        code,
      });

      localStorage.setItem("token", verifyRes.data.token);
      dispatch(fetchCurrentUser(verifyRes.data.token));

      dispatch(showNotification({ message: "Welcome!", type: "success" }));
      navigate("/");
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || "Registration failed",
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

      dispatch(showNotification({ message: "Logged in with Google!", type: "success" }));
      navigate("/");
    } catch (err) {
      console.error("Google signup error", err);
      dispatch(showNotification({ message: "Google signup failed", type: "error" }));
    }
  };

  return (
    <div className={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="Email"
          {...register("email")}
        />
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        {errors.password && <p className={styles.error}>{errors.password.message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>

      <div className={styles["google-signup"]}>
        <GoogleLogin
          onSuccess={handleGoogleSignup}
          onError={() =>
            dispatch(showNotification({ message: "Google signup failed", type: "error" }))
          }
        />
      </div>
    </div>
  );
};

export default RegisterForm;
