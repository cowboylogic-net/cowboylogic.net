import clsx from "clsx";
import styles from "./BaseForm.module.css";

/**
 * BaseForm
 * Контейнер для будь-якої форми з правильним відступом, адаптивністю, доступністю.
 */
const BaseForm = ({
  children,
  onSubmit,
  className,
  noValidate = true,
  role = "form",
  ...rest
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={clsx(styles.form, className)}
      noValidate={noValidate}
      role={role}
      {...rest}
    >
      {children}
    </form>
  );
};

export default BaseForm;
