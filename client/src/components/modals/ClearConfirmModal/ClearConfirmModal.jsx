import { useTranslation } from "react-i18next";
import styles from "./ClearConfirmModal.module.css";
import BaseButton from "../../BaseButton/BaseButton";

const ClearConfirmModal = ({ onConfirm, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{t("modals.clearAllTitle")}</h3>
        <p>{t("modals.clearAllMessage")}</p>
        <div className={styles.actions}>
          <BaseButton variant="outline" onClick={onConfirm}>
            {t("modals.clearAllConfirm")}
          </BaseButton>
          <BaseButton variant="outline" onClick={onClose}>
            {t("modals.cancel")}
          </BaseButton>
        </div>
      </div>
    </div>
  );
};

export default ClearConfirmModal;
