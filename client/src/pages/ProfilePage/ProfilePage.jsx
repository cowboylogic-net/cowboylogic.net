import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import styles from "./ProfilePage.module.css";

import BaseButton from "../../components/BaseButton/BaseButton";
import ResetPasswordModal from "../../components/modals/ResetPasswordModal/ResetPasswordModal";

const ProfilePage = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const [showResetModal, setShowResetModal] = useState(false);

  return (
    <div className="layoutContainer">
      <div className={styles.container}>
        <div className={styles.profileColumn}>
          <div className={styles.leftColumn}>
            <div className={styles.avatarWrapper}>
              <img
                src={user?.avatarURL || "/assets/images/default-avatar.png"}
                alt="User avatar"
                className={styles.avatar}
              />
            </div>
            <h1 className="pageTitle">{t("profile.title")}</h1>

            {user ? (
              <>
                <p>
                  <strong>{t("profile.email")}:</strong> {user.email}
                </p>
                <p>
                  <strong>{t("profile.role")}:</strong> {user.role}
                </p>
                <p>
                  <Link to="/favorites">{t("profile.favorites")}</Link>
                </p>
              </>
            ) : (
              <p>👤 {t("auth.error")}</p>
            )}

            <BaseButton
              variant="auth"
              onClick={() => setShowResetModal(true)}
            >
              {t("resetPassword.title")}
            </BaseButton>
          </div>
        </div>
      </div>

      {showResetModal && (
        <ResetPasswordModal onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
};

export default ProfilePage;
