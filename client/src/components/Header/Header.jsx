import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import UserMenu from "../UserMenu/UserMenu";
import BurgerNavbar from "../BurgerNavbar/BurgerNavbar";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <div className={`layoutContainer ${styles.headerInner}`}>
        <div className={styles.leftBlock}>
          <Link to="/" className={styles.logo}>
            CowboyLogic
          </Link>
          
          <p className={styles.tagline}>{t("header.tagline")}</p>
          <Breadcrumbs />
        </div>

        <div className={styles.rightBlock}>
          <div className={styles.desktopMenu}>
            <UserMenu />
            <div className={styles.langSwitcher}>
              <LanguageSwitcher />
            </div>
          </div>
          <div className={styles.mobileMenu}>
            <BurgerNavbar />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;