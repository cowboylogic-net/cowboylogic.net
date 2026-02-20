import multer from "multer";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import HttpError from "../helpers/HttpError.js";
import {
  avatarUploadProfile,
  bookUploadProfile,
  editorUploadProfile,
  IMAGE_FORMAT_ALLOWLIST,
  isCloudinaryProvider,
  uploadBasePath,
  uploadTempPath,
} from "../config/imageConfig.js";

const allowedFormats = new Set(IMAGE_FORMAT_ALLOWLIST);
const tempRoot = path.resolve(uploadTempPath);

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      // best-effort cleanup
    }
  }
};

const sanitizeFilename = (originalname = "upload") => {
  const ext = path.extname(originalname).toLowerCase();
  const rawBase = path.basename(originalname, ext);
  const safeBase = rawBase
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .slice(0, 80);

  return `${safeBase || "image"}-${Date.now()}${ext}`;
};

const createStorage = (profile) =>
  multer.diskStorage({
    destination: async (req, _file, cb) => {
      try {
        const rootDir = isCloudinaryProvider ? uploadTempPath : uploadBasePath;
        const subdir = isCloudinaryProvider
          ? profile.cloudSubdir
          : profile.diskSubdir;
        const absDir = path.resolve(rootDir, subdir);

        await ensureDir(absDir);
        req._uploadSubdir = subdir;
        cb(null, absDir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (_req, file, cb) => {
      cb(null, sanitizeFilename(file.originalname));
    },
  });

const createFileFilter = (profile) => (_req, file, cb) => {
  if (profile.mimeAllowlist.includes(file.mimetype)) return cb(null, true);

  const error = new Error("Unsupported media type");
  error.code = "LIMIT_FILE_TYPE";
  cb(error);
};

const createUploader = (profile) =>
  multer({
    storage: createStorage(profile),
    fileFilter: createFileFilter(profile),
    limits: { fileSize: profile.maxBytes },
  });

const mapUploadError = (error) => {
  if (!error) return null;

  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return HttpError(413, "File too large", "FILE_TOO_LARGE");
  }

  if (error?.code === "LIMIT_FILE_TYPE") {
    return HttpError(415, "Unsupported media type", "UNSUPPORTED_MEDIA");
  }

  return error;
};

const createSingleUploadMiddleware = (uploader, fieldName) => {
  const middleware = uploader.single(fieldName);

  return (req, res, next) => {
    middleware(req, res, async (error) => {
      if (!error) return next();
      await safeUnlink(req.file?.path);
      return next(mapUploadError(error));
    });
  };
};

const isTempFilePath = (filePath) => {
  if (!filePath) return false;
  const absoluteFilePath = path.resolve(filePath);
  return (
    absoluteFilePath === tempRoot ||
    absoluteFilePath.startsWith(`${tempRoot}${path.sep}`)
  );
};

export const cleanupTempFileIfNeeded = async (filePath) => {
  if (!isTempFilePath(filePath)) return;
  await safeUnlink(filePath);
};

export const uploadAvatar = createUploader(avatarUploadProfile);
export const uploadBookImage = createUploader(bookUploadProfile);
export const uploadEditorImage = createUploader(editorUploadProfile);

export const uploadAvatarFile = createSingleUploadMiddleware(
  uploadAvatar,
  avatarUploadProfile.fieldName,
);
export const uploadBookImageFile = createSingleUploadMiddleware(
  uploadBookImage,
  bookUploadProfile.fieldName,
);
export const uploadEditorImageFile = createSingleUploadMiddleware(
  uploadEditorImage,
  editorUploadProfile.fieldName,
);

export const validateDecodedImage = async (req, _res, next) => {
  if (!req.file?.path) {
    return next(HttpError(400, "No file uploaded", "UPLOAD_MISSING_FILE"));
  }

  try {
    const metadata = await sharp(req.file.path).metadata();

    if (!metadata?.format || !allowedFormats.has(metadata.format)) {
      await safeUnlink(req.file.path);
      req.file = undefined;
      return next(
        HttpError(415, "Unsupported media type", "UNSUPPORTED_MEDIA"),
      );
    }

    return next();
  } catch {
    await safeUnlink(req.file.path);
    req.file = undefined;
    return next(HttpError(415, "Unsupported media type", "UNSUPPORTED_MEDIA"));
  }
};

export const validateDecodedImageIfPresent = async (req, _res, next) => {
  if (!req.file?.path) return next();
  return validateDecodedImage(req, _res, next);
};

export const cleanupTempUploadOnError = async (error, req, _res, next) => {
  await safeUnlink(req.file?.path);
  next(error);
};

export const optimizeImage = async (req, _res, next) => {
  if (!req.file) return next();
  if (isCloudinaryProvider) return next();

  const ext = path.extname(req.file.filename).toLowerCase();
  const dir = path.dirname(req.file.path);
  const optimizedName = `${path.basename(req.file.filename, ext)}-optimized.webp`;
  const optimizedPath = path.join(dir, optimizedName);

  try {
    await sharp(req.file.path)
      .resize({ width: 400, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(optimizedPath);

    await safeUnlink(req.file.path);

    req.file.path = optimizedPath;
    req.file.mimetype = "image/webp";

    const subdir = req._uploadSubdir || "misc";
    req.file.webPath = "/" + path.posix.join("uploads", subdir, optimizedName);
  } catch {
    const subdir = req._uploadSubdir || "misc";
    req.file.webPath = "/" + path.posix.join("uploads", subdir, req.file.filename);
  }

  next();
};
