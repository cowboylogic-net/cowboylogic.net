import styles from "./Loader.module.css";

const Loader = ({ label = "Loading…", fullScreen = false }) => {
  return (
    <div
      className={`${styles.wrapper} ${fullScreen ? styles.fullScreen : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default Loader;
