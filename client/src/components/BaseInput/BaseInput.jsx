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
  inline = false,
  ...rest
}) => {
  const inputId = id || name;
  const showError = Boolean(error && touched);

  return (
    <div
      className={clsx(
        inline ? styles.inlineWrapper : styles.fieldWrapper,
        className
      )}
    >
      {!inline && label && (
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

      {!inline && !showError && helperText && (
        <div className={styles.helper}>{helperText}</div>
      )}
      {!inline && showError && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default BaseInput;