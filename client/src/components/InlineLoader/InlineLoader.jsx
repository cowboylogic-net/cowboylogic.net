// InlineLoader.jsx
import clsx from "clsx";
import styles from "./InlineLoader.module.css";

const InlineLoader = ({
  label = "Loading",
  size = "1em",                     // масштабує крапки відносно шрифту контейнера
  color = "var(--color-accent)",    // підхоплює вашу тему
  className,
}) => {
  return (
    <span
      className={clsx(styles.inlineLoader, className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      style={{ fontSize: size, color }}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
    </span>
  );
};

export default InlineLoader;
