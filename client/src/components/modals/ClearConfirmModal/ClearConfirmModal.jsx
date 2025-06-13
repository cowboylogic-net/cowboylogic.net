import { useTranslation } from "react-i18next";
import styles from "./ClearConfirmModal.module.css";

const ClearConfirmModal = ({ onConfirm, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{t("modals.clearAllTitle")}</h3>
        <p>{t("modals.clearAllMessage")}</p>
        <div className={styles.actions}>
          <button className="btn btn-outline" onClick={onConfirm}>
            {t("modals.clearAllConfirm")}
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            {t("modals.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearConfirmModal;
