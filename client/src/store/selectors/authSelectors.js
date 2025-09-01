// src/store/selectors/authSelectors.js

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuth = (state) => Boolean(state.auth.token);
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserAvatar = (state) => state.auth.user?.avatarURL;

// Поки є токен, але user ще не підтягнувся — вважаємо, що auth "бу́титься"
export const selectAuthBooting = (s) =>
  s.auth.isLoading || (!!s.auth.token && !s.auth.user);

// Надійна перевірка адмінських прав
export const selectIsAdmin = (s) => {
  const u = s.auth.user;
  if (!u) return false;
  const role = String(u.role || "").toLowerCase(); // уніфікація регістру
  return role === "admin" || role === "superadmin" || u.isSuperAdmin === true;
};