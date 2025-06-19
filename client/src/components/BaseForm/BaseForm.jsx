// src/components/BaseForm/BaseForm.jsx
import clsx from "clsx";
import styles from "./BaseForm.module.css";

const BaseForm = ({ children, onSubmit, className, ...rest }) => {
  return (
    <form
      onSubmit={onSubmit}
      className={clsx(styles.form, className)}
      {...rest}
    >
      {children}
    </form>
  );
};

export default BaseForm;
