import { useTranslation } from "react-i18next";
import styles from "./DeleteConfirmModal.module.css";
import BaseButton from "../../BaseButton/BaseButton";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{t("modals.deleteTitle")}</h3>
        <p>{t("modals.deleteBookMessage")}</p>
        <div className={styles.actions}>
          <BaseButton variant="outline" onClick={onClose}>
            {t("modals.cancel")}
          </BaseButton>
          <BaseButton variant="outline" onClick={onConfirm}>
            {t("modals.delete")}
          </BaseButton>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
