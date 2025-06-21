import clsx from "clsx";
import styles from "./BaseButton.module.css";

const BaseButton = ({
  children,
  variant = "primary", // додано підтримку "auth"
  size = "default",
  type = "button",
  disabled = false,
  fullWidth = false,
  className,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        className // додаткові стилі ззовні
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default BaseButton;
