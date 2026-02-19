import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logoutUser } from "../../store/thunks/authThunks";
import {
  selectAuthBooting,
  selectUser,
} from "../../store/selectors/authSelectors";
import { selectCartBadgeCount } from "../../store/selectors/cartSelectors";
import { useTranslation } from "react-i18next";

import styles from "./UserMenu.module.css";
import BaseButton from "../BaseButton/BaseButton";

const UserMenu = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const authBooting = useSelector(selectAuthBooting);
  const cartCount = useSelector(selectCartBadgeCount);
  const { t } = useTranslation();
  const cartBadgeValue = cartCount > 99 ? "99+" : String(cartCount);
  const cartAriaLabel = `${t("userMenu.cart")} (${cartCount} item${cartCount === 1 ? "" : "s"})`;

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const firstName =
    user?.fullName?.trim()?.split(/\s+/)[0] ||
    user?.name?.trim()?.split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <>
      {authBooting ? (
        <>
          <Link
            to="/cart"
            className={styles.cartLink}
            aria-label={cartAriaLabel}
          >
            <BaseButton variant="outline">{`🛒 ${t("userMenu.cart")}`}</BaseButton>
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartBadgeValue}</span>
            )}
          </Link>
          <span className={styles.authPlaceholder}>
            {t("userMenu.authLoading", "Loading account...")}
          </span>
        </>
      ) : user ? (
        <>
          <Link
            to="/cart"
            className={styles.cartLink}
            aria-label={cartAriaLabel}
          >
            <BaseButton variant="outline">{`🛒 ${t("userMenu.cart")}`}</BaseButton>
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartBadgeValue}</span>
            )}
          </Link>
          <Link to="/orders">
            <BaseButton variant="outline">{t("userMenu.orders")}</BaseButton>
          </Link>
          <Link to="/profile">
            <BaseButton variant="outline">{t("userMenu.profile")}</BaseButton>
          </Link>

          <span className={styles.userEmail}>
            {t("userMenu.welcome", { name: firstName })}
          </span>

          <BaseButton variant="outline" onClick={handleLogout}>
            {t("userMenu.logout")}
          </BaseButton>
        </>
      ) : (
        <>
          <Link
            to="/cart"
            className={styles.cartLink}
            aria-label={cartAriaLabel}
          >
            <BaseButton variant="outline">{`🛒 ${t("userMenu.cart")}`}</BaseButton>
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartBadgeValue}</span>
            )}
          </Link>
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
