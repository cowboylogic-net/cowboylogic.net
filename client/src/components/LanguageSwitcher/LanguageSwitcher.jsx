import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.css";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className={styles.switcher}>
      <button
        onClick={() => handleLanguageChange("en")}
        className={currentLang === "en" ? styles.active : ""}
      >
        EN
      </button>
      {/* <button
        onClick={() => handleLanguageChange("es")}
        className={currentLang === "es" ? styles.active : ""}
      >
        ES
      </button> */}
    </div>
  );
};

export default LanguageSwitcher;
