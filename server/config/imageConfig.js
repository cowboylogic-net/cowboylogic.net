import path from "path";

export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
export const maxImageSize = 5 * 1024 * 1024; // 5MB

// ← тепер це абсолютний шлях з .env або fallback на public/uploads
export const uploadBasePath = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve("public/uploads");