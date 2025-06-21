
import styles from "./ConfirmModal.module.css";
import BaseButton from "../../BaseButton/BaseButton";
import { useTranslation } from "react-i18next";

const ConfirmModal = ({ onConfirm, onClose, title, message }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // prevent modal close when clicking inside
      >
        <h3>{title || t("confirm.title")}</h3>
        <p>{message || t("confirm.message")}</p>
        <div className={styles.actions}>
          <BaseButton variant="outline" onClick={onClose}>
            {t("confirm.cancel")}
          </BaseButton>
          <BaseButton variant="outline" onClick={onConfirm}>
            {t("confirm.confirm")}
          </BaseButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
