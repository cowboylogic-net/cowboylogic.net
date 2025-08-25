import express from "express";
import bookController from "../controllers/bookController.js";
import { upload, optimizeImage } from "../middleware/uploadMiddleware.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { createBookSchema, updateBookSchema } from "../schemas/bookSchema.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { validateBody } from "../middleware/validateBody.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateParams } from "../middleware/validateParams.js";
import { idParamSchema } from "../schemas/paramsSchemas.js";

const router = express.Router();
const { getPartnerBooks } = bookController;

router.delete(
  "/:id",
  protect,
  isAdmin,
  validateParams(idParamSchema),
  bookController.deleteBook
);

router.post(
  "/",
  protect,
  isAdmin,
  upload.single("image"),
  optimizeImage, // ✅ робимо webp + ставимо webPath
  validateBody(createBookSchema, true),
  bookController.createBook
);

router.put(
  "/:id",
  protect,
  isAdmin,
  upload.single("image"),
  optimizeImage, // ✅ те саме для оновлення
  validateParams(idParamSchema),
  validateBody(updateBookSchema, true),
  bookController.updateBook
);

router.get(
  "/partner-books",
  protect,
  requireRole("partner", "admin", "superAdmin"),
  getPartnerBooks
);

router.get("/", optionalAuth, bookController.getBooks);
router.get(
  "/:id",
  optionalAuth,
  validateParams(idParamSchema),
  bookController.getBookById
);

router.post("/check-stock", protect, bookController.checkStock);

export default router;
