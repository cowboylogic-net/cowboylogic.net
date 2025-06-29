// routes/userSelfRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import userSelfController from "../controllers/userSelfController.js";
import {
  upload,
  optimizeImage,
  removeOldAvatar,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ✅ PATCH /api/me/avatar (твоє правильне ім'я роуту)
router.patch(
  "/avatar",
  protect,
  upload.single("avatar"),
  removeOldAvatar,
  optimizeImage,
  userSelfController.updateAvatar
);

export default router;
