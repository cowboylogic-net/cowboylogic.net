import styles from "./FormGroup.module.css";
import clsx from "clsx";

const FormGroup = ({ label, error, required = false, children, className, forId }) => {
  return (
    <div className={clsx(styles.formGroup, className)}>
      {label && (
        <label className={styles.label} htmlFor={forId}>
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
