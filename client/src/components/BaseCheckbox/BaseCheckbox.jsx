import clsx from "clsx";
import React from "react";
import styles from "./BaseCheckbox.module.css";

const BaseCheckbox = React.forwardRef(
  ({ id, name, label, disabled = false, className, ...rest }, ref) => {
    const checkboxId = id || name;

    return (
      <label className={clsx(styles.wrapper, className)}>
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          ref={ref}
          disabled={disabled}
          className={styles.checkbox}
          {...rest}
        />
        <span className={styles.label}>{label}</span>
      </label>
    );
  }
);
BaseCheckbox.displayName = "BaseCheckbox";

export default BaseCheckbox;
