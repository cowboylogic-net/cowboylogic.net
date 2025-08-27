// routes/imageRoutes.js
import express from "express";
import { upload, optimizeImage } from "../middleware/uploadMiddleware.js";
import sendResponse from "../utils/sendResponse.js";

const router = express.Router();

// routes/imageRoutes.js
router.post("/upload", upload.single("image"), optimizeImage, (req, res) => {
  if (!req.file) {
    return sendResponse(res, { code: 400, message: "No file uploaded" });
  }

  // коректний протокол/хост за проксі
  const proto = (req.headers["x-forwarded-proto"]?.split(",")[0]) || req.protocol;
  const host  = req.headers["x-forwarded-host"] || req.get("host");
  const base  = `${proto}://${host}`.replace(/\/+$/, "");

  // відносний шлях від мідлвари або запасний варіант
  const rel = req.file.webPath || `/uploads/${req.file.filename}`;

  // абсолютний URL
  const imageUrl = /^https?:\/\//i.test(rel) ? rel : `${base}${rel}`;

  return sendResponse(res, { code: 200, data: { imageUrl } });
});


export default router;
