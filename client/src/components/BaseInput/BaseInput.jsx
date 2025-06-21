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
  return (
    <div className={clsx(styles.fieldWrapper, className)}>
      {label && (
        <label htmlFor={id || name} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={clsx(styles.input, error && touched && styles.errorInput)}
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

export default BaseInput;
