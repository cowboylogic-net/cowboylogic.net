import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className="layoutContainer">
      <div className={styles.loaderWrapper}>
        <div className={styles.loader}>Loading...</div>
      </div>
    </div>
  );
};

export default Loader;
