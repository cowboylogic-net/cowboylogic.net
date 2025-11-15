import clsx from "clsx";
import styles from "./BaseButton.module.css";

const BaseButton = ({
  as: Component = "button",
  children,
  variant = "primary",
  size = "default",
  type = "button",
  disabled = false,
  fullWidth = false,
  className,
  ...props
}) => {
  const classes = clsx(
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    className
  );

  if (Component !== "button") {
    return (
      <Component className={classes} aria-disabled={disabled} {...props}>
        {children}
      </Component>
    );
  }
  return (
    <button type={type} disabled={disabled} className={classes} {...props}>
      {children}
    </button>
  );
};

export default BaseButton;
