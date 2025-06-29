import multer from "multer";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import {
  allowedImageTypes,
  maxImageSize,
  uploadBasePath,
} from "../config/imageConfig.js";

// 🧱 Створити базову папку, якщо не існує
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(uploadBasePath, { recursive: true });
  } catch (err) {
    console.error("❌ Failed to create upload directory:", err.message);
  }
};

await ensureUploadDir();

// 📁 Визначити підкаталог в залежності від типу завантаження
const resolveUploadDir = (req) => {
  const url = req.baseUrl + req.path;

  if (url.includes("/me")) return path.resolve(uploadBasePath, "avatars");
  if (url.includes("/books")) return path.resolve(uploadBasePath, "bookCovers");
  if (url.includes("/pages")) return path.resolve(uploadBasePath, "pageContent");

  return path.resolve(uploadBasePath, "images");
};

// 🧰 Multer конфігурація
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = resolveUploadDir(req);
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext);
    const uniqueName = `${base}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// ✅ Фільтрація дозволених типів
const fileFilter = (_, file, cb) => {
  allowedImageTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Unsupported file type"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxImageSize },
});

// 🔧 Оптимізація зображення (resize + webp)
export const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  if (!req.file.mimetype.startsWith("image/")) {
    console.warn("❌ Not an image:", req.file.mimetype);
    return res.status(400).json({ message: "Unsupported file type" });
  }

  const originalPath = req.file.path;
  const ext = path.extname(req.file.filename).toLowerCase();
  const dir = path.dirname(req.file.path);
  const optimizedName = `${path.basename(req.file.filename, ext)}-optimized.webp`;
  const optimizedPath = path.join(dir, optimizedName);

  try {
    await sharp(originalPath)
      .resize({ width: 400, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(optimizedPath);

    await fs.unlink(originalPath);

    // 📝 Оновлюємо дані у req для контролера
    const relativePath = path.relative("public", optimizedPath).replace(/\\/g, "/");
    req.file.filename = relativePath;
    req.file.path = optimizedPath;
    req.file.mimetype = "image/webp";
  } catch (err) {
    console.error("❌ Image optimization failed:", err.message);
  }

  next();
};

// 🧹 Видалення попереднього аватара користувача
export const removeOldAvatar = async (req, res, next) => {
  try {
    const oldUrl = req.user?.avatarURL;
    if (oldUrl) {
      const filename = path.basename(oldUrl);
      const fullPath = path.join("public", "uploads", "avatars", filename);
      await fs.unlink(fullPath);
      console.log("🧹 Removed old avatar:", filename);
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn("⚠️ Failed to remove old avatar:", err.message);
    }
  }
  next();
};
