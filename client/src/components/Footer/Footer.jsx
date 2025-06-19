import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import NewsletterSignup from "../NewsletterSignup/NewsletterSignup";
import styles from "./Footer.module.css";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className="layoutContainer">
        <div className={styles.topSection}>
          <div className={styles.column}>
            <h3 className={styles.heading}>{t("footer.navigation")}</h3>
            <ul className={styles.navList}>
              <li>
                <Link to="/contact">{t("footer.contact")}</Link>
              </li>
              <li>
                <Link to="/about">{t("footer.about")}</Link>
              </li>
              <li>
                <Link to="/clstrategies/cowboy-college-consulting">
                  {t("footer.consulting")}
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.heading}>{t("footer.followUs")}</h3>
            <ul className={styles.socialList}>
              <li>
                <a
                  href="https://www.facebook.com/groups/26342439190"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook className={styles.icon} /> Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/cowboy_logic_press/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram className={styles.icon} /> Instagram
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.heading}>{t("footer.newsletter")}</h3>
            <NewsletterSignup />
          </div>
        </div>

        <div className={styles.bottomSection}>
          <p className={styles.footerContent}>
            {t("footer.copyright", { year: "2025" })}{" "}
            <Link to="/">Roger Haller</Link>. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
