// routes/imageRoutes.js
import express from "express";
import { upload, optimizeImage } from "../middleware/uploadMiddleware.js";
import sendResponse from "../utils/sendResponse.js";

const router = express.Router();

router.post("/upload", upload.single("image"), optimizeImage, (req, res) => {
  if (!req.file) {
    return sendResponse(res, { code: 400, message: "No file uploaded" });
  }

  // ✅ Використовуємо веб-шлях, який підготувала мідлвара (включно з -optimized.webp)
  const imageUrl = req.file.webPath;

  return sendResponse(res, {
    code: 200,
    data: { imageUrl }, // ✅ shape: json.data.imageUrl
  });
});

export default router;
