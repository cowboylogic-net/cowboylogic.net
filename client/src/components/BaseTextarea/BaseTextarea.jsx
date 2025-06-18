// src/components/BaseTextarea/BaseTextarea.jsx
import clsx from "clsx";
import styles from "./BaseTextarea.module.css";

const BaseTextarea = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  required = false,
  helperText,
  disabled = false,
  rows = 4,
  className,
  ...rest
}) => {
  return (
    <div className={clsx(styles.fieldWrapper, className)}>
      {label && (
        <label htmlFor={id || name} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <textarea
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={clsx(styles.textarea, error && touched && styles.errorInput)}
        disabled={disabled}
        {...rest}
      />

      {helperText && !error && (
        <div className={styles.helper}>{helperText}</div>
      )}

      {error && touched && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default BaseTextarea;
