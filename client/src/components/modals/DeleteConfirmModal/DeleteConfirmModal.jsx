import { useTranslation } from "react-i18next";
import styles from "./DeleteConfirmModal.module.css";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <p>{t("modals.deleteBookMessage")}</p>
        <div className={styles.buttons}>
          <button onClick={onClose} className="btn btn-outline">
            {t("modals.cancel")}
          </button>
          <button onClick={onConfirm} className="btn btn-outline">
            {t("modals.delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
