import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ResetPasswordForm from "../../components/ResetPasswordForm/ResetPasswordForm";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);

  return (
    <div className={styles.profilePage}>
      <h1>{t("profile.title")}</h1>
      <p>
        <strong>{t("profile.email")}:</strong> {user?.email}
      </p>
      <p>
        <strong>{t("profile.role")}:</strong> {user?.role}
      </p>
      <Link to="/favorites">{t("profile.favorites")}</Link>

      <h2>{t("profile.changePassword")}</h2>
      <div className={styles.resetForm}>
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ProfilePage;
