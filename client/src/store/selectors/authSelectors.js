// src/store/selectors/authSelectors.js

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuth = (state) => Boolean(state.auth.token);
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserAvatar = (state) => state.auth.user?.avatarURL;
export const selectBootstrapStatus = (state) => state.auth.bootstrapStatus;
export const selectAuthKnown = (state) => state.auth.bootstrapStatus === "done";
export const selectIsInitializingAuth = (state) =>
  state.auth.bootstrapStatus !== "done";

export const selectAuthBooting = (state) =>
  state.auth.bootstrapStatus !== "done";

export const selectIsAdmin = (state) => {
  const user = state.auth.user;
  if (!user) return false;

  const role = String(user.role || "").toLowerCase();
  return role === "admin" || role === "superadmin" || user.isSuperAdmin === true;
};
