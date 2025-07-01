import styles from "./NewsletterSignup.module.css";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "../../store/axios";
import { showNotification } from "../../store/slices/notificationSlice";

import BaseInput from "../../components/BaseInput/BaseInput";
import BaseButton from "../../components/BaseButton/BaseButton";

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
          message: err.response?.data?.message || t("newsletter.error"),
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
          <BaseInput
            id="newsletter"
            type="email"
            size="sm"
            aria-label={t("newsletter.label")}
            placeholder={t("newsletter.placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <BaseButton className={styles.subscribeBtn} type="submit" variant="outline">
            {t("newsletter.button")}
          </BaseButton>
        </div>
      </form>
    </div>
  );
};

export default NewsletterSignup;
