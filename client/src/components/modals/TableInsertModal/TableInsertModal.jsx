import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./TableInsertModal.module.css";

const TableInsertModal = ({ onInsert, onClose }) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tableHTML = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        ${"<tr>" + "<th>Header</th>".repeat(cols) + "</tr>"}
        ${Array.from({ length: rows })
          .map(() => "<tr>" + "<td>Data</td>".repeat(cols) + "</tr>")
          .join("")}
      </table>
    `;
    onInsert(tableHTML);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{t("modals.insertTableTitle")}</h3>
        <form onSubmit={handleSubmit}>
          <label>
            {t("modals.rows")}:
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(+e.target.value)}
              min="1"
              max="20"
            />
          </label>
          <label>
            {t("modals.columns")}:
            <input
              type="number"
              value={cols}
              onChange={(e) => setCols(+e.target.value)}
              min="1"
              max="10"
            />
          </label>
          <div className={styles["modal-actions"]}>
            <button type="submit" className="btn btn-outline">
              {t("modals.insert")}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              {t("modals.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableInsertModal;
