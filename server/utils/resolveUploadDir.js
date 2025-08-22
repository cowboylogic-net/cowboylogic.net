// utils/resolveUploadDir.js
export const resolveUploadDir = (baseUrl = "") => {
  const path = String(baseUrl || "").split("?")[0];
  const segments = path.split("/").filter(Boolean).map(s => s.toLowerCase());

  if (segments.includes("me")) return "avatars";
  if (segments.includes("books")) return "bookCovers";
  if (segments.includes("pages")) return "pageImages";
  return "misc";
};
