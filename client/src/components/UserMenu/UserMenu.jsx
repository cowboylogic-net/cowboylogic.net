import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import { selectUser } from "../../store/selectors/authSelectors";
import styles from "./UserMenu.module.css";
import { useTranslation } from "react-i18next"; // 🧠

const UserMenu = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { t } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {user ? (
        <>
          <Link to="/cart" className={styles.authBtn}>🛒 {t("userMenu.cart")}</Link>
          <Link to="/orders" className={styles.authBtn}>{t("userMenu.orders")}</Link>
          <Link to="/profile" className={styles.authBtn}>{t("userMenu.profile")}</Link>
          <span className={styles.userEmail}>{t("userMenu.welcome", { email: user.email })}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>{t("userMenu.logout")}</button>
        </>
      ) : (
        <>
          <Link to="/login" className={styles.authBtn}>{t("userMenu.login")}</Link>
          <Link to="/register" className={styles.authBtn}>{t("userMenu.register")}</Link>
        </>
      )}
    </>
  );
};

export default UserMenu;

