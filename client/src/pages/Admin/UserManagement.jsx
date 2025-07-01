import styles from "./UserManagement.module.css";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { ROLES } from "../../constants/roles";
import { apiService } from "../../services/axiosService";
import { showNotification } from "../../store/slices/notificationSlice";
import BaseButton from "../../components/BaseButton/BaseButton";
import BaseSelect from "../../components/BaseSelect/BaseSelect";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiService.get("/users", true);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      dispatch(
        showNotification({ message: t("users.fetchError"), type: "error" })
      );
    }
  }, [dispatch, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (id, newRole) => {
    try {
      await apiService.patch(`/users/${id}/role`, { role: newRole }, true);
      fetchUsers();
      dispatch(
        showNotification({ message: t("users.roleUpdated"), type: "success" })
      );
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || t("users.updateFailed"),
          type: "error",
        })
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("users.confirmDelete"))) return;
    try {
      await apiService.delete(`/users/${id}`, true);
      fetchUsers();
      dispatch(
        showNotification({ message: t("users.userDeleted"), type: "success" })
      );
    } catch (err) {
      dispatch(
        showNotification({
          message: err.response?.data?.message || t("users.deleteFailed"),
          type: "error",
        })
      );
    }
  };

  return (
    <div className="layoutContainer">
      <div className={styles.container}>
        <h2>{t("users.managementTitle")}</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>{t("users.email")}</th>
                <th>{t("users.role")}</th>
                <th>{t("users.createdAt")}</th>
                <th>{t("users.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.email}
                    {u.isSuperAdmin && " 👑"}
                  </td>
                  <td>
                    {u.isSuperAdmin ? (
                      <strong>{t("users.superAdmin")}</strong>
                    ) : (
                      <BaseSelect
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        options={[
                          { value: ROLES.USER, label: t("users.user") },
                          { value: ROLES.ADMIN, label: t("users.admin") },
                        ]}
                        compact
                      />
                    )}
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {!u.isSuperAdmin && (
                      <BaseButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(u.id)}
                      >
                        {t("users.delete")}
                      </BaseButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
