// store/slices/authActions.js
export const updateUserAvatar = (url) => ({
  type: "auth/updateUserAvatar",
  payload: url,
});
