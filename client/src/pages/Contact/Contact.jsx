import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import styles from "./Contact.module.css";
import axios from "../../store/axios";
import { showNotification } from "../../store/slices/notificationSlice";

const Contact = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/contact", { firstName, lastName, email, comment });

      dispatch(
        showNotification({
          message: t("contact.success"),
          type: "success",
        })
      );

      setFirstName("");
      setLastName("");
      setEmail("");
      setComment("");
    } catch {
      dispatch(
        showNotification({
          message: t("contact.error"),
          type: "error",
        })
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contact}>
        <h2>{t("contact.title")}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("contact.firstNamePlaceholder")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder={t("contact.lastNamePlaceholder")}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder={t("contact.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            placeholder={t("contact.commentPlaceholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit">{t("contact.submit")}</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
