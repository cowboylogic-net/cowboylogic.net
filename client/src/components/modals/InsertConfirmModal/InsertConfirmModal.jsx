import { useTranslation } from "react-i18next";
import styles from "./InsertConfirmModal.module.css";

const InsertConfirmModal = ({ type, html, url, onConfirm, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>
          {t("modals.insertConfirmTitle", {
            type: t(`modals.${type}`, type) // fallback — вставить raw "table" або "link"
          })}
        </h3>

        {type === "table" && (
          <div
            className={styles.preview}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {type === "link" && (
          <p className={styles.preview}>
            <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
          </p>
        )}

        <div className={styles.buttons}>
          <button className="btn btn-outline" onClick={onConfirm}>
            {t("modals.insert")}
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            {t("modals.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsertConfirmModal;

