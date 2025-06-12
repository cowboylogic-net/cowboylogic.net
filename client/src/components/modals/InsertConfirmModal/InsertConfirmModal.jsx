// src/components/modals/InsertConfirmModal/InsertConfirmModal.jsx

import styles from "./InsertConfirmModal.module.css";

const InsertConfirmModal = ({ type, html, url, onConfirm, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Insert {type}?</h3>
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
            Insert
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


export default InsertConfirmModal;
