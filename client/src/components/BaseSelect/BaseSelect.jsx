import clsx from "clsx";
import styles from "./BaseSelect.module.css";

const BaseSelect = ({
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
  disabled = false,
  options = [],
  className,
  ...rest
}) => {
  const selectId = id || name;
  const showError = Boolean(error && touched);

  return (
    <div className={clsx(styles.fieldWrapper, className)}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={clsx(
          styles.select,
          showError && styles.errorInput,
          disabled && styles.disabled
        )}
        aria-invalid={showError}
        aria-required={required}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {showError && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default BaseSelect;
