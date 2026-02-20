import path from "path";

export const IMAGE_MIME_ALLOWLIST = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const IMAGE_FORMAT_ALLOWLIST = ["jpeg", "png", "webp"];

export const MEDIA_PROVIDER = String(process.env.MEDIA_PROVIDER || "disk")
  .trim()
  .toLowerCase();
export const isCloudinaryProvider = MEDIA_PROVIDER === "cloudinary";

export const uploadBasePath = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve("public/uploads");

export const uploadTempPath = process.env.UPLOADS_TEMP_DIR
  ? path.resolve(process.env.UPLOADS_TEMP_DIR)
  : path.resolve("tmp/uploads");

export const avatarUploadProfile = {
  fieldName: "avatar",
  maxBytes: 3 * 1024 * 1024,
  mimeAllowlist: IMAGE_MIME_ALLOWLIST,
  cloudSubdir: "avatars",
  diskSubdir: "avatars",
};

export const bookUploadProfile = {
  fieldName: "image",
  maxBytes: 5 * 1024 * 1024,
  mimeAllowlist: IMAGE_MIME_ALLOWLIST,
  cloudSubdir: "books",
  diskSubdir: "bookCovers",
};

export const editorUploadProfile = {
  fieldName: "image",
  maxBytes: 5 * 1024 * 1024,
  mimeAllowlist: IMAGE_MIME_ALLOWLIST,
  cloudSubdir: "pages",
  diskSubdir: "pageImages",
};
