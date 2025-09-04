// // routes/imageRoutes.js
import express from "express";
import { upload, optimizeImage } from "../middleware/uploadMiddleware.js";
import sendResponse from "../utils/sendResponse.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("image"),
  optimizeImage,
  (req, res) => {
    if (!req.file) {
      return sendResponse(res, { code: 400, message: "No file uploaded" });
    }

    const rel = req.file.webPath || `/uploads/${req.file.filename}`;
    const base = (process.env.BASE_URL || "").replace(/\/+$/, "");
    const abs = base ? `${base}${rel}` : rel;
    // побудуємо абсолютні варіанти, якщо є
    const variants = Array.isArray(req.file.variants)
      ? req.file.variants.map((v) => ({
          ...v,
          url: base ? `${base}${v.url}` : v.url,
        }))
      : [];
    return sendResponse(res, {
      code: 200,
      data: {
        imageUrl: abs, // дефолт (для зворотної сумісності)
        relUrl: rel,
        variants, // [{url,w,fmt},...]
      },
    });
  }
);
export default router;
