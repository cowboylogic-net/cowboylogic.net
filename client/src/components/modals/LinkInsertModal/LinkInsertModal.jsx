import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./LinkInsertModal.module.css";

const LinkInsertModal = ({ onInsert, onClose }) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onInsert(url.trim());
      setUrl("");
      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{t("modals.insertLinkTitle")}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <input
              type="url"
              placeholder={t("modals.linkPlaceholder")}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className="btn btn-outline">
              {t("modals.insert")}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              {t("modals.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkInsertModal;
