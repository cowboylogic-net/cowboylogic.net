import styles from "./FormGroup.module.css";
import clsx from "clsx";

const FormGroup = ({ label, error, required = false, children, className }) => {
  return (
    <div className={clsx(styles.formGroup, className)}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      {children}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default FormGroup;
