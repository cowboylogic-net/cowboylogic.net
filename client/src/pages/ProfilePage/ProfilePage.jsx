
import styles from "./ProfilePage.module.css";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import BaseButton from "../../components/BaseButton/BaseButton";
import ResetPasswordModal from "../../components/modals/ResetPasswordModal/ResetPasswordModal";
import UploadAvatar from "../../components/UploadAvatar/UploadAvatar";
import { apiService } from "../../services/axiosService";
import { showNotification } from "../../store/slices/notificationSlice";
import { updateUserAvatar } from "../../store/slices/authSlice"; 

const ProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await apiService.patch("/me/avatar", formData, true);
      dispatch(updateUserAvatar(response.data.data.avatarURL));
      dispatch(
        showNotification({
          type: "success",
          message: t("profile.avatarUpdated"),
        })
      );
    } catch (err) {
      dispatch(
        showNotification({
          type: "error",
          message: err.message || t("profile.avatarUploadError"),
        })
      );
    }
  };

  return (
    <div className="layoutContainer">
      <div className={styles.container}>
        <UploadAvatar
          currentAvatar={user?.avatarURL}
          onUpload={handleAvatarUpload}
        />

        <h1 className={styles.title}>{t("profile.title")}</h1>

        {user ? (
          <div className={styles.profileInfo}>
            <p>
              <strong>{t("profile.email")}:</strong> {user.email}
            </p>
            <p>
              <strong>{t("profile.role")}:</strong> {user.role}
            </p>
            <p>
              <Link to="/favorites">{t("profile.favorites")}</Link>
            </p>
          </div>
        ) : (
          <p>👤 {t("auth.error")}</p>
        )}

        <BaseButton
          variant="outline"
          onClick={() => setShowResetModal(true)}
          className={styles.resetButton}
        >
          {t("resetPassword.title")}
        </BaseButton>
      </div>

      {showResetModal && (
        <ResetPasswordModal onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
};

export default ProfilePage;
