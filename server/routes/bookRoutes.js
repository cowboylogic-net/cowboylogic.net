import express from "express";
import bookController from "../controllers/bookController.js";
import {
  optimizeImage,
  uploadBookImageFile,
  validateDecodedImageIfPresent,
} from "../middleware/uploadMiddleware.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { createBookSchema, updateBookSchema } from "../schemas/bookSchema.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { validateBody } from "../middleware/validateBody.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateParams } from "../middleware/validateParams.js";
import { idParamSchema } from "../schemas/paramsSchemas.js";
import validateQuery from "../middleware/validateQuery.js";
import {
  booksQuerySchema,
  partnerBooksQuerySchema,
} from "../schemas/paginationSchema.js";

const router = express.Router();
const { getPartnerBooks } = bookController;

router.delete(
  "/:id",
  protect,
  isAdmin,
  validateParams(idParamSchema),
  bookController.deleteBook,
);

router.post(
  "/",
  protect,
  isAdmin,
  uploadBookImageFile,
  validateDecodedImageIfPresent,
  optimizeImage,
  validateBody(createBookSchema, true),
  bookController.createBook,
);

router.put(
  "/:id",
  protect,
  isAdmin,
  uploadBookImageFile,
  validateDecodedImageIfPresent,
  optimizeImage,
  validateParams(idParamSchema),
  validateBody(updateBookSchema, true),
  bookController.updateBook,
);

router.patch(
  "/:id",
  protect,
  isAdmin,
  uploadBookImageFile,
  validateDecodedImageIfPresent,
  optimizeImage,
  validateParams(idParamSchema),
  validateBody(updateBookSchema, true),
  bookController.updateBook,
);

router.get(
  "/partner-books",
  protect,
  requireRole("partner", "admin", "superAdmin"),
  validateQuery(partnerBooksQuerySchema),
  getPartnerBooks,
);

router.get(
  "/",
  optionalAuth,
  validateQuery(booksQuerySchema),
  bookController.getBooks,
);
router.get(
  "/:id",
  optionalAuth,
  validateParams(idParamSchema),
  bookController.getBookById,
);

router.post("/check-stock", protect, bookController.checkStock);

export default router;
