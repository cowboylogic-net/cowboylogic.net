import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { ROLES } from "../../constants/roles";
import { apiService } from "../../services/axiosService";
import { showNotification } from "../../store/slices/notificationSlice";
import styles from "./UserManagement.module.css";

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
    <div className={styles.container}>
      <h2>{t("users.managementTitle")}</h2>
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
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value={ROLES.USER}>{t("users.user")}</option>
                    <option value={ROLES.ADMIN}>{t("users.admin")}</option>
                  </select>
                )}
              </td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                {!u.isSuperAdmin && (
                  <button onClick={() => handleDelete(u.id)}>
                    {t("users.delete")}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
