import styles from "./Pagination.module.css";
import BaseButton from "../BaseButton/BaseButton";

const Pagination = ({ page, totalPages, onPageChange, isDisabled }) => {
  const prevDisabled = page <= 1 || isDisabled;
  const nextDisabled = page >= totalPages || isDisabled;

  return (
    <nav className={styles.wrapper} aria-label="Pagination">
      <BaseButton
        variant="outline"
        disabled={prevDisabled}
        onClick={() => onPageChange(page - 1)}
      >
        ← Prev
      </BaseButton>

      <span className={styles.info}>
        Page {page} of {totalPages}
      </span>

      <BaseButton
        variant="outline"
        disabled={nextDisabled}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </BaseButton>
    </nav>
  );
};

export default Pagination;
