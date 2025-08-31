export const resolveUploadDir = (baseUrl) => {
  if (baseUrl.includes("/me")) return "avatars";
  if (baseUrl.includes("/books")) return "bookCovers";
  if (baseUrl.includes("/pages")) return "pageImages";
  return "misc";
};
