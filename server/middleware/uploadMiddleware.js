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
import { VARIANTS, FORMATS } from "../config/imageVariants.js";

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
  const base = path.basename(req.file.filename, ext);
  const subdir = req._uploadSubdir || "misc";

  const widths = VARIANTS[subdir] || VARIANTS.misc;

  // з’ясуємо фактичну ширину оригіналу
  let origW;
  try {
    const meta = await sharp(req.file.path).metadata();
    origW = meta.width || undefined;
  } catch {}
  // беремо лише ті цілі ширини, що не більші за оригінал (якщо відома)
  const targetWidths = Array.isArray(widths)
    ? origW
      ? widths.filter((w) => w <= origW)
      : widths
    : [];

  try {
    const created = []; // { url, w, fmt }

    // Створюємо варіанти
    const widthsToMake = targetWidths.length ? targetWidths : [widths[0]];
    for (const w of widthsToMake) {
      for (const f of FORMATS) {
        const outName = `${base}-w${w}.${f.ext}`;
        const outPath = path.join(dir, outName);

        const pipeline = sharp(req.file.path)
          .rotate() // ✅ авто-виправлення EXIF орієнтації
          .resize({
            width: w,
            withoutEnlargement: true,
          });
        await f.sharp(pipeline).toFile(outPath);

        created.push({
          url: "/" + path.posix.join("uploads", subdir, outName), // POSIX URL
          w,
          fmt: f.ext,
        });
      }
    }

    // Оригінал більше не потрібен
    try {
      await fs.unlink(req.file.path);
    } catch {}

    // Вибираємо дефолт для зворотної сумісності відповіді
    // (беремо середній webp, або перший доступний)
    const uniqueW = [...new Set(created.map((x) => x.w))].sort((a, b) => a - b);
    const midW = uniqueW[Math.min(1, uniqueW.length - 1)];
    const def =
      created.find((x) => x.w === midW && x.fmt === "webp") || created[0];

    // Записуємо в req.file
    req.file.variants = created; // повний список
    req.file.webPath = def.url; // старе поле — працює далі
    req.file.path = path.join(dir, path.basename(def.url)); // не критично, але хай вказує на дефолт
  } catch (err) {
    console.error("Image optimization failed:", err.message);
    // fallback: залишаємо оригінал як є, але даємо webPath для нього
    req.file.variants = [];
    req.file.webPath =
      "/" + path.posix.join("uploads", subdir, req.file.filename);
  }

  next();
};

// Видалення попереднього аватара
export const removeOldAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next(); // лише якщо новий файл справді прийшов

    let oldUrl = req.user?.avatarURL; // може бути "/uploads/..." або "https://.../uploads/..."
    if (!oldUrl) return next();

    // ✅ Якщо абсолютний — витягнемо pathname
    if (/^https?:\/\//i.test(oldUrl)) {
      try {
        const u = new URL(oldUrl);
        oldUrl = u.pathname || oldUrl;
      } catch {}
    }

    // ✅ працюємо тільки з тим, що реально під /uploads/
    if (oldUrl.startsWith("/uploads/")) {
      // "uploads/avatars/xxx.webp" або "uploads\avatars\xxx.webp" -> "avatars/xxx.webp"
      const relUnderUploads = oldUrl
        .replace(/^\/?uploads[\\/]/i, "")
        .replace(/\\/g, "/");
      const full = path.join(uploadBasePath, relUnderUploads);
      const dir = path.dirname(full);
      const base = path.basename(full);
      // шукаємо патерн <name>-wNNN.ext → видаляємо всі варіанти з тим самим префіксом <name>-w
      const m = base.match(/^(.*)-w\d+\.(avif|webp|jpe?g)$/i);
      if (m) {
        const prefix = `${m[1]}-w`;
        try {
          const names = await fs.readdir(dir);
          await Promise.all(
            names
              .filter(
                (n) => n.startsWith(prefix) && /\.(avif|webp|jpe?g)$/i.test(n)
              )
              .map((n) =>
                fs.unlink(path.join(dir, n)).catch((e) => {
                  if (e.code !== "ENOENT")
                    console.warn("unlink variant failed:", e.message);
                })
              )
          );
        } catch (e) {
          if (e.code !== "ENOENT")
            console.warn("readdir variants failed:", e.message);
        }
      } else {
        // старі аватари без варіантів
        await fs.unlink(full);
      }
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn("Failed to remove old avatar:", err.message);
    }
  }
  next();
};
