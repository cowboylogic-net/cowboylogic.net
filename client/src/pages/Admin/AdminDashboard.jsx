// src/pages/Admin/AdminDashboard.jsx
import styles from "./AdminDashboard.module.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


const AdminDashboard = () => {
  const { t } = useTranslation();

  return (

      <div className="layoutContainer">
        <div className={styles.adminDashboard}>
          <h2>{t("admin.dashboardTitle")}</h2>
          <ul className={styles.menu}>
            <li>
              <Link to="/admin/books/new">{t("admin.addBook")}</Link>
            </li>
            <li>
              <Link to="/admin/users">{t("admin.userManagement")}</Link>
            </li>
            <li>
              <Link to="/admin/newsletter">{t("admin.sendNewsletter")}</Link>
            </li>
          </ul>
        </div>
      </div>

  );
};

export default AdminDashboard;

