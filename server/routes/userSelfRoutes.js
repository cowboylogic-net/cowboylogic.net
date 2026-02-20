// routes/userSelfRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import userSelfController from "../controllers/userSelfController.js";
import {
  optimizeImage,
  uploadAvatarFile,
  validateDecodedImage,
} from "../middleware/uploadMiddleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { userSelfUpdateSchema, partnerProfileUpsertSchema } from "../schemas/meSchemas.js";

const router = express.Router();

router.use(protect);

router.patch("/", validateBody(userSelfUpdateSchema), userSelfController.updateMe);

router.patch(
  "/avatar",
  uploadAvatarFile,
  validateDecodedImage,
  optimizeImage,
  userSelfController.updateAvatar
);

router.patch(
  "/partner-profile",
  validateBody(partnerProfileUpsertSchema),
  userSelfController.upsertMyPartnerProfile
);

export default router;
