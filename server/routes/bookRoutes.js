// routes/bookRoutes.js
import express from "express";
import bookController from "../controllers/bookController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { createBookSchema, updateBookSchema } from "../schemas/bookSchema.js";
import { validateBody } from "../middleware/validateBody.js";

const router = express.Router();

router.get("/", bookController.getBooks);
router.get("/:id", bookController.getBookById);
router.delete("/:id", protect, isAdmin, bookController.deleteBook);

router.post(
  "/",
  protect,
  isAdmin,
  upload.single("image"),
  validateBody(createBookSchema, true), // true => для FormData
  bookController.createBook
);

router.put(
  "/:id",
  protect,
  isAdmin,
  upload.single("image"),
  validateBody(updateBookSchema, true), // true => для FormData
  bookController.updateBook
);
router.post("/check-stock", protect, bookController.checkBookStock);

export default router;
