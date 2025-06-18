// src/components/BaseButton/BaseButton.jsx
import clsx from "clsx";
import styles from "./BaseButton.module.css";

const BaseButton = ({
  children,
  variant = "primary", // 'primary' | 'outline'
  size = "default",     // 'default' | 'small' | 'large'
  type = "button",
  disabled = false,
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
        disabled && styles.disabled
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default BaseButton;
