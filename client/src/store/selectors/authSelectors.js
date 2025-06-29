// src/store/selectors/authSelectors.js

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuth = (state) => Boolean(state.auth.token);
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserAvatar = (state) => state.auth.user?.avatarURL;
