import clsx from "clsx";
import styles from "./BaseRadio.module.css";

const BaseRadio = ({
  id,
  name,
  label,
  value,
  checked,
  onChange,
  disabled = false,
  className,
  ...rest
}) => {
  const radioId = id || `${name}-${value}`;

  return (
    <label className={clsx(styles.wrapper, className)}>
      <input
        type="radio"
        id={radioId}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={styles.radio}
        {...rest}
      />
      <span className={styles.label}>{label}</span>
    </label>
  );
};

export default BaseRadio;

