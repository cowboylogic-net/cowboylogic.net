// routes/bookRoutes.js
import express from "express";
import bookController from "../controllers/bookController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { createBookSchema, updateBookSchema } from "../schemas/bookSchema.js";
import { validateBody } from "../middleware/validateBody.js";
import { requireRole } from "../middleware/requireRole.js";



const router = express.Router();
const { getPartnerBooks } = bookController;

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
router.get("/partner-books", protect, requireRole("partner", "admin", "superAdmin"), getPartnerBooks);
router.get("/", protect, bookController.getBooks);
router.get("/:id", protect, bookController.getBookById);
router.post("/check-stock", protect, bookController.checkStock);




export default router;
