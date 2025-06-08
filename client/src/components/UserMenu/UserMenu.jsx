// src/components/UserMenu/UserMenu.jsx
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import { selectUser } from "../../store/selectors/authSelectors";
import styles from "./UserMenu.module.css";
 // 🔄 важливо: використовуємо ті самі стилі

const UserMenu = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {user ? (
        <>
          <Link to="/cart" className={styles.authBtn}>🛒 Cart</Link>
          <Link to="/orders" className={styles.authBtn}>My Orders</Link>
          <Link to="/profile" className={styles.authBtn}>My Profile</Link>
          <span className={styles.userEmail}>Welcome, {user.email}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" className={styles.authBtn}>Login</Link>
          <Link to="/register" className={styles.authBtn}>Register</Link>
        </>
      )}
    </>
  );
};

export default UserMenu;
