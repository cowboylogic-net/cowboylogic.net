import clsx from "clsx";
import styles from "./BaseInput.module.css";

const BaseInput = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  required = false,
  helperText,
  disabled = false,
  className,
  ...rest
}) => {
  const inputId = id || name;
  const showError = Boolean(error && touched);

  return (
    <div className={clsx(styles.fieldWrapper, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={clsx(
          styles.input,
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

export default BaseInput;
