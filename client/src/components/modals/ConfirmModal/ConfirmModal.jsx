// components/modals/ConfirmModal/ConfirmModal.jsx
import styles from "./ConfirmModal.module.css";

const ConfirmModal = ({ message, onConfirm, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Discard Changes?</h3>
        <p>{message || "You have unsaved changes. Are you sure you want to cancel editing?"}</p>
        <div className={styles.actions}>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-outline" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
