import clsx from "clsx";
import styles from "./BaseCheckbox.module.css";

const BaseCheckbox = ({
  id,
  name,
  label,
  checked,
  onChange,
  disabled = false,
  className,
  ...rest
}) => {
  const checkboxId = id || name;

  return (
    <label className={clsx(styles.wrapper, className)}>
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={styles.checkbox}
        {...rest}
      />
      <span className={styles.label}>{label}</span>
    </label>
  );
};

export default BaseCheckbox;
