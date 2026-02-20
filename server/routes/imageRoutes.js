import { randomUUID } from "crypto";
import express from "express";
import HttpError from "../helpers/HttpError.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  cleanupTempFileIfNeeded,
  optimizeImage,
  uploadEditorImageFile,
  validateDecodedImage,
} from "../middleware/uploadMiddleware.js";
import { getPublicBase } from "../config/publicBase.js";
import { isCloudinaryProvider } from "../config/imageConfig.js";
import sendResponse from "../utils/sendResponse.js";
import { uploadImageFromPath } from "../services/cloudinary.js";
import Page from "../models/Page.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  requireRole("admin", "superAdmin"),
  uploadEditorImageFile,
  validateDecodedImage,
  optimizeImage,
  async (req, res, next) => {
    const filePath = req.file?.path || null;

    try {
      if (!req.file?.path) {
        throw HttpError(400, "No file uploaded", "UPLOAD_MISSING_FILE");
      }

      const slug = String(req.body?.slug || "").trim().toLowerCase();
      if (!slug) {
        throw HttpError(400, "slug is required", "UPLOAD_SLUG_REQUIRED");
      }

      const page = await Page.findOne({ where: { slug } });
      if (!page) {
        throw HttpError(404, "Page not found", "PAGE_NOT_FOUND");
      }

      if (isCloudinaryProvider) {
        const publicId = `cowboylogic/pages/${slug}/${page.id}/asset-${randomUUID()}`;

        const uploadResult = await uploadImageFromPath({
          filePath,
          publicId,
          overwrite: false,
          invalidate: false,
          kind: "editor",
          tags: [
            "resource:page-asset",
            `page:${slug}`,
            `pageId:${page.id}`,
            `env:${process.env.NODE_ENV || "development"}`,
          ],
        });

        return sendResponse(res, {
          code: 200,
          data: { imageUrl: uploadResult.secureUrl },
        });
      }

      const rel = req.file.webPath || `/uploads/${req.file.filename}`;
      const base = getPublicBase(req);
      const abs = base ? `${base}${rel}` : rel;

      return sendResponse(res, {
        code: 200,
        data: { imageUrl: abs, relUrl: rel },
      });
    } catch (error) {
      return next(error);
    } finally {
      await cleanupTempFileIfNeeded(filePath);
    }
  },
);

export default router;
