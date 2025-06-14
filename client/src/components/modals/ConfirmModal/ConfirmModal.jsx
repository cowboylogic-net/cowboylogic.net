import { useTranslation } from "react-i18next";
import styles from "./ConfirmModal.module.css";

const ConfirmModal = ({ message, onConfirm, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{t("modals.discardTitle")}</h3>
        <p>{message || t("modals.discardMessage")}</p>
        <div className={styles.actions}>
          <button className="btn btn-outline" onClick={onClose}>
            {t("modals.cancel")}
          </button>
          <button className="btn btn-outline" onClick={onConfirm}>
            {t("modals.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
