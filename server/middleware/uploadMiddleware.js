// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import {
  allowedImageTypes,
  maxImageSize,
  uploadBasePath,
} from "../config/imageConfig.js";
import { resolveUploadDir } from "../utils/resolveUploadDir.js";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const subdir = resolveUploadDir(req.baseUrl);
      const absDir = path.resolve(uploadBasePath, subdir);
      await fs.mkdir(absDir, { recursive: true });
      req._uploadSubdir = subdir;
      cb(null, absDir);
    } catch (e) {
      cb(e);
    }
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const rawBase = path.basename(file.originalname, ext);
    const safeBase = rawBase
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "-")
      .slice(0, 80);
    cb(null, `${safeBase}-${Date.now()}${ext}`);
  },
});

const fileFilter = (_, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype)) return cb(null, true);
  const err = new Error("Unsupported file type");
  err.status = 400;
  err.code = "LIMIT_FILE_TYPE";
  cb(err);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxImageSize },
});

// Оптимізація: робимо 400px ширину, webp, і виставляємо webPath
export const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();
  if (!req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "Unsupported file type" });
  }

  const ext = path.extname(req.file.filename).toLowerCase();
  const dir = path.dirname(req.file.path);
  const optimizedName = `${path.basename(
    req.file.filename,
    ext
  )}-optimized.webp`;
  const optimizedPath = path.join(dir, optimizedName);

  try {
    await sharp(req.file.path)
      .resize({ width: 400, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(optimizedPath);

    await fs.unlink(req.file.path); // прибираємо оригінал

    req.file.path = optimizedPath; // абсолютний шлях на диску
    req.file.mimetype = "image/webp";

    const subdir = req._uploadSubdir || "misc";
    // важливо: для URL завжди POSIX-слеші
    req.file.webPath = "/" + path.posix.join("uploads", subdir, optimizedName); // ← те, що віддаємо клієнту
  } catch (err) {
    console.error("Image optimization failed:", err.message);
    const subdir = req._uploadSubdir || "misc";
    // оригінал лишається на диску, тому віддаємо його веб-шлях
    req.file.webPath =
      "/" + path.posix.join("uploads", subdir, req.file.filename);
    // залишаємо оригінальний mimetype як є
  }

  next();
};

// Видалення попереднього аватара
export const removeOldAvatar = async (req, res, next) => {
  try {
    const oldUrl = req.user?.avatarURL; // очікуємо "/uploads/avatars/xxx.webp"
    if (oldUrl && oldUrl.startsWith("/uploads/")) {
      const rel = oldUrl.replace(/^\//, ""); // "uploads/avatars/xxx.webp"
      const full = path.join("public", rel);
      await fs.unlink(full);
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn("Failed to remove old avatar:", err.message);
    }
  }
  next();
};
