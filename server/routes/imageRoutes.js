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
    
    return sendResponse(res, {
      code: 200,
      data: { imageUrl: abs, relUrl: rel },
    });
  }
);
export default router;
