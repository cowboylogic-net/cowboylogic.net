import styles from "./ProfilePage.module.css";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import BaseButton from "../../components/BaseButton/BaseButton";
import UploadAvatar from "../../components/UploadAvatar/UploadAvatar";
import BaseInput from "../../components/BaseInput/BaseInput";
import { apiService } from "../../services/axiosService";
import { showNotification } from "../../store/slices/notificationSlice";
import { updateUserAvatar } from "../../store/slices/authSlice";
import { updateMe, upsertPartnerProfile } from "../../store/thunks/authThunks";
import { ROLES } from "../../constants/roles";

const InlineEditRow = ({
  label,
  value,
  onSave,
  type = "text",
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [next, setNext] = useState(value ?? "");

  return (
    <div className={styles.row}>
      <strong className={styles.label}>{label}:</strong>

      {!editing ? (
        <>
          <span className={styles.value}>{String(value ?? "—")}</span>
          {!disabled && (
            <div className={styles.actions}>
              <BaseButton variant="outline" onClick={() => setEditing(true)}>
                {t("common.edit")}
              </BaseButton>
            </div>
          )}
        </>
      ) : (
        <>
          {/* ⬇️ клітинка колонки 2 */}
          <div className={styles.inputCell}>
            {type === "checkbox" ? (
              <input
                type="checkbox"
                checked={!!next}
                onChange={(e) => setNext(e.target.checked)}
                className={styles.checkbox}
              />
            ) : (
              <BaseInput
                className={styles.control} // ⬅️ вирівнюємо висоту з кнопками
                type={type}
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
            )}
          </div>

          {/* ⬇️ клітинка колонки 3 (обидві кнопки в одному ряду) */}
          <div className={styles.actions}>
            <BaseButton
              className={styles.control}
              variant="outline"
              onClick={async () => {
                await onSave(next);
                setEditing(false);
              }}
            >
              {t("common.save")}
            </BaseButton>
            <BaseButton
              className={styles.control}
              variant="outline"
              onClick={() => {
                setNext(value ?? (type === "checkbox" ? false : ""));
                setEditing(false);
              }}
            >
              {t("common.cancel")}
            </BaseButton>
          </div>
        </>
      )}
    </div>
  );
};

const InlinePassword = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await apiService.patch("/auth/reset-password", {
        oldPassword,
        newPassword,
      });
      dispatch(
        showNotification({
          type: "success",
          message: t("profile.passwordUpdated"),
        })
      );
      setEditing(false);
      setOld("");
      setNew("");
      // токени інвалідовані на бекенді; твій axios-інтерцептор має вилогінити при 401
    } catch (e) {
      dispatch(
        showNotification({
          type: "error",
          message:
            e.response?.data?.message || t("profile.passwordUpdateError"),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.group}>
      <h3 className={styles.subtitle}>{t("profile.security")}</h3>
      {!editing ? (
        <BaseButton variant="outline" onClick={() => setEditing(true)}>
          {t("resetPassword.title")}
        </BaseButton>
      ) : (
        <div className={styles.inlineForm}>
          <BaseInput
            className={styles.control} // ⬅️
            type="password"
            placeholder={t("resetPassword.oldPassword")}
            value={oldPassword}
            onChange={(e) => setOld(e.target.value)}
          />
          <BaseInput
            className={styles.control} // ⬅️
            type="password"
            placeholder={t("resetPassword.newPassword")}
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
          />
          <BaseButton
            className={styles.control}
            disabled={loading}
            variant="outline"
            onClick={submit}
          >
            {t("common.save")}
          </BaseButton>
          <BaseButton
            className={styles.control}
            variant="outline"
            onClick={() => {
              setEditing(false);
              setOld("");
              setNew("");
            }}
          >
            {t("common.cancel")}
          </BaseButton>
        </div>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

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

  if (!user) {
    return (
      <div className="layoutContainer">
        <p>👤 {t("auth.error")}</p>
      </div>
    );
  }

  const isPartner = user.role === ROLES.PARTNER;

  return (
    <div className="layoutContainer">
      <div className={styles.container}>
        <UploadAvatar
          currentAvatar={user?.avatarURL}
          onUpload={handleAvatarUpload}
        />

        <h1 className={styles.title}>{t("profile.title")}</h1>

        <div className={styles.group}>
          <h3 className={styles.subtitle}>{t("profile.account")}</h3>

          <div className={styles.row}>
            <strong className={styles.label}>{t("profile.email")}:</strong>
            <span className={styles.value}>{user.email}</span>
          </div>

          <div className={styles.row}>
            <strong className={styles.label}>{t("profile.role")}:</strong>
            <span className={styles.value}>{user.role}</span>
          </div>

          <InlineEditRow
            label={t("profile.fullName")}
            value={user.fullName}
            onSave={async (v) => {
              await dispatch(updateMe({ fullName: v })).unwrap();
              dispatch(
                showNotification({
                  type: "success",
                  message: t("profile.saved"),
                })
              );
            }}
          />

          <InlineEditRow
            label={t("profile.phoneNumber")}
            value={user.phoneNumber}
            onSave={async (v) => {
              await dispatch(updateMe({ phoneNumber: v })).unwrap();
              dispatch(
                showNotification({
                  type: "success",
                  message: t("profile.saved"),
                })
              );
            }}
          />

          <InlineEditRow
            label={t("profile.newsletter")}
            value={!!user.newsletter}
            type="checkbox"
            onSave={async (v) => {
              await dispatch(updateMe({ newsletter: !!v })).unwrap();
              dispatch(
                showNotification({
                  type: "success",
                  message: t("profile.saved"),
                })
              );
            }}
          />

          <InlineEditRow
            label={t("profile.heardAboutUs")}
            value={user.heardAboutUs}
            onSave={async (v) => {
              await dispatch(updateMe({ heardAboutUs: v })).unwrap();
              dispatch(
                showNotification({
                  type: "success",
                  message: t("profile.saved"),
                })
              );
            }}
          />

          <div className={styles.row}>
            <Link to="/favorites">❤️ {t("profile.favorites")}</Link>
          </div>
        </div>

        {isPartner && (
          <div className={styles.group}>
            <h3 className={styles.subtitle}>{t("profile.partnerProfile")}</h3>

            <InlineEditRow
              label={t("registerForm.organizationName")}
              value={user.partnerProfile?.organizationName}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ organizationName: v })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />

            <InlineEditRow
              label={t("registerForm.businessType")}
              value={user.partnerProfile?.businessType}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ businessType: v })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />

            <InlineEditRow
              label={t("registerForm.businessWebsite")}
              value={user.partnerProfile?.businessWebsite}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ businessWebsite: v || null })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />

            <InlineEditRow
              label={t("registerForm.contactPhone")}
              value={user.partnerProfile?.contactPhone}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ contactPhone: v || null })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />

            <InlineEditRow
              label={t("registerForm.address")}
              value={user.partnerProfile?.address}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ address: v || null })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />

            <InlineEditRow
              label="Address 2"
              value={user.partnerProfile?.address2}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ address2: v || null })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />

            <InlineEditRow
              label={t("registerForm.billingAddress")}
              value={user.partnerProfile?.billingAddress}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ billingAddress: v || null })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />

            <InlineEditRow
              label={t("registerForm.city")}
              value={user.partnerProfile?.city}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ city: v || null })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />

            <InlineEditRow
              label={t("registerForm.state")}
              value={user.partnerProfile?.state}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ state: v || null })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />

            <InlineEditRow
              label={t("registerForm.postalCode")}
              value={user.partnerProfile?.postalCode}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ postalCode: v || null })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />

            <InlineEditRow
              label={t("registerForm.country")}
              value={user.partnerProfile?.country}
              onSave={async (v) => {
                await dispatch(
                  upsertPartnerProfile({ country: v || null })
                ).unwrap();
                dispatch(
                  showNotification({
                    type: "success",
                    message: t("profile.saved"),
                  })
                );
              }}
            />
          </div>
        )}

        <InlinePassword />
      </div>
    </div>
  );
};

export default ProfilePage;
