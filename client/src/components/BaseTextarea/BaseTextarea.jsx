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
  size = "md", // sm | md | lg
  className,
  ...rest
}) => {
  const textareaId = id || name;
  const showError = Boolean(error && touched);

  return (
    <div className={clsx(styles.fieldWrapper, className)}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={clsx(
          styles.textarea,
          styles[size],
          showError && styles.errorInput,
          disabled && styles.disabled
        )}
        disabled={disabled}
        aria-invalid={showError}
        aria-required={required}
        {...rest}
      />

      {!showError && helperText && (
        <div className={styles.helper}>{helperText}</div>
      )}
      {showError && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default BaseTextarea;
