import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import UserMenu from "../UserMenu/UserMenu";
import { useTranslation } from "react-i18next"; // 🔁

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftBlock}>
          <Link to="/" className={styles.logo}>
            CowboyLogic
          </Link>
          <p className={styles.tagline}>
            {t("header.tagline")}
          </p>
        </div>

        <div className={styles.authBlock}>
          <UserMenu />
          <div className={styles.langSwitcher}>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
