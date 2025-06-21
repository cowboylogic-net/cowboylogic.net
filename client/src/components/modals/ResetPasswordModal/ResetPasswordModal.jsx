import ResetPasswordForm from "../../ResetPasswordForm/ResetPasswordForm";
import styles from "./ResetPasswordModal.module.css";

const ResetPasswordModal = ({ onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{`Reset Password`}</h3>
        <ResetPasswordForm onSuccess={onClose} />
      </div>
    </div>
  );
};

export default ResetPasswordModal;
