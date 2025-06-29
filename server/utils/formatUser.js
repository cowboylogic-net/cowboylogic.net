// export const formatUser = (user) => ({
//   id: user.id,
//   email: user.email,
//   role: user.role,
//   isSuperAdmin: user.isSuperAdmin,
//   avatarURL: user.avatarURL
//     ? `${process.env.BASE_URL}${user.avatarURL.startsWith("/") ? "" : "/"}${user.avatarURL}`
//     : null,
// });
// utils/formatUser.js
export const formatUser = (user) => {
  const plain = user.toJSON();
  if (plain.avatarURL && !plain.avatarURL.startsWith("http")) {
    plain.avatarURL = `${process.env.BASE_URL}${plain.avatarURL}`;
  }
  return plain;
};
