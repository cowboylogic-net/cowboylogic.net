// src/components/Header/Header.jsx
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import UserMenu from "../UserMenu/UserMenu"; // ⬅️ новий імпорт

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftBlock}>
          <Link to="/" className={styles.logo}>
            CowboyLogic
          </Link>
          <p className={styles.tagline}>CowboyLogic Strategies/Publishing</p>
        </div>

        <div className={styles.authBlock}>
          <UserMenu /> {/* 🔄 замість старої логіки */}
          <div className={styles.langSwitcher}>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; // test

