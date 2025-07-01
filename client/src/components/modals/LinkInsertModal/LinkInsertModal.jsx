import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./LinkInsertModal.module.css";
import BaseButton from "../../BaseButton/BaseButton";
import BaseInput from "../../BaseInput/BaseInput";
import BaseForm from "../../BaseForm/BaseForm";
import FormGroup from "../../FormGroup/FormGroup";

const LinkInsertModal = ({ onInsert, onClose }) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onInsert(url.trim());
      setUrl("");
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{t("modals.insertLinkTitle")}</h3>
        <BaseForm onSubmit={handleSubmit}>
          <FormGroup label={t("modals.linkLabel")}>
            <BaseInput
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("modals.linkPlaceholder")}
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

export default LinkInsertModal;
