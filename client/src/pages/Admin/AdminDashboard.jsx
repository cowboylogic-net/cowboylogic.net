import styles from "./AdminDashboard.module.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { showNotification } from "../../store/slices/notificationSlice";

import { ROLES } from "../../constants/roles";


const AdminDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user || ![ROLES.ADMIN, ROLES.SUPERADMIN].includes(user.role)) {
      dispatch(
        showNotification({ message: t("admin.accessDenied"), type: "error" })
      );
    }
  }, [user, dispatch, t]);

  if (!user || ![ROLES.ADMIN, ROLES.SUPERADMIN].includes(user.role)) {
    return <p>{t("admin.accessDenied")}</p>;
  }

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


