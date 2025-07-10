import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logoutUser } from "../../store/thunks/authThunks";
import { selectUser } from "../../store/selectors/authSelectors";
import { useTranslation } from "react-i18next";

import styles from "./UserMenu.module.css";
import BaseButton from "../BaseButton/BaseButton";

const UserMenu = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { t } = useTranslation();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <>
      {user ? (
        <>
          <Link to="/cart">
            <BaseButton variant="outline">{`🛒 ${t("userMenu.cart")}`}</BaseButton>
          </Link>
          <Link to="/orders">
            <BaseButton variant="outline">{t("userMenu.orders")}</BaseButton>
          </Link>
          <Link to="/profile">
            <BaseButton variant="outline">{t("userMenu.profile")}</BaseButton>
          </Link>
          <span className={styles.userEmail}>
            {t("userMenu.welcome", { email: user.email })}
          </span>
          <BaseButton variant="outline" onClick={handleLogout}>
            {t("userMenu.logout")}
          </BaseButton>
        </>
      ) : (
        <>
          <Link to="/login">
            <BaseButton variant="outline">{t("userMenu.login")}</BaseButton>
          </Link>
          <Link to="/register">
            <BaseButton variant="outline">{t("userMenu.register")}</BaseButton>
          </Link>
        </>
      )}
    </>
  );
};

export default UserMenu;
