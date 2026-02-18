import express from "express";
import { upload, optimizeImage } from "../middleware/uploadMiddleware.js";
import sendResponse from "../utils/sendResponse.js";
import { protect } from "../middleware/authMiddleware.js";
import HttpError from "../helpers/HttpError.js";
import { getPublicBase } from "../config/publicBase.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("image"),
  optimizeImage,
  (req, res, next) => {
    if (!req.file) {
      return next(HttpError(400, "No file uploaded", "UPLOAD_MISSING_FILE"));
    }

    const rel = req.file.webPath || `/uploads/${req.file.filename}`;
    const base = getPublicBase(req);
    const abs = base ? `${base}${rel}` : rel;

    return sendResponse(res, {
      code: 200,
      data: { imageUrl: abs, relUrl: rel },
    });
  },
);
export default router;
