import styles from "./Forbidden.module.css";

const Forbidden = () => {
  return (
    <div className="layoutContainer">
      <div className={styles.box}>
        <h1>403 — Forbidden</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    </div>
  );
};

export default Forbidden;
