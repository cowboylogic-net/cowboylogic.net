import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "../../store/axios";
import { showNotification } from "../../store/slices/notificationSlice";
import styles from "./NewsletterSignup.module.css";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/newsletter/subscribe", { email });
      dispatch(
        showNotification({
          message: t("newsletter.success"),
          type: "success",
        })
      );
      setEmail("");
    } catch (err) {
      dispatch(
        showNotification({
          message:
            err.response?.data?.message || t("newsletter.error"),
          type: "error",
        })
      );
    }
  };

  return (
    <div className={styles.newsletter}>
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="newsletter">{t("newsletter.label")}</label>
        <div className={styles.inputGroup}>
          <input
            id="newsletter"
            type="email"
            placeholder={t("newsletter.placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className={styles.subscribeBtn}>
            {t("newsletter.button")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsletterSignup;
