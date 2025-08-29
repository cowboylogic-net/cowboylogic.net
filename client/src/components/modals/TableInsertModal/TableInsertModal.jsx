import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./TableInsertModal.module.css";
import BaseButton from "../../BaseButton/BaseButton";
import BaseInput from "../../BaseInput/BaseInput";
import BaseForm from "../../BaseForm/BaseForm";
import FormGroup from "../../FormGroup/FormGroup";

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
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{t("modals.insertTableTitle")}</h3>
        <BaseForm onSubmit={handleSubmit}>
          <FormGroup label={t("modals.rows")}>
            <BaseInput
              type="number"
              value={rows}
              onChange={(e) => setRows(+e.target.value)}
              min="1"
              max="20"
              required
            />
          </FormGroup>

          <FormGroup label={t("modals.columns")}>
            <BaseInput
              type="number"
              value={cols}
              onChange={(e) => setCols(+e.target.value)}
              min="1"
              max="10"
              required
            />
          </FormGroup>

          <div className={styles.actions}>
            <BaseButton type="submit" variant="outline">
              {t("modals.insert")}
            </BaseButton>
            <BaseButton type="button" variant="outline" onClick={onClose}>
              {t("modals.cancel")}
            </BaseButton>
          </div>
        </BaseForm>
      </div>
    </div>
  );
};

export default TableInsertModal;
