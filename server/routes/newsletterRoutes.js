// routes/newsletterRoutes.js
import express from "express";
import newsletterController from "../controllers/newsletterController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateBody.js";
import {
  subscribeNewsletterSchema,
  sendNewsletterSchema,
} from "../schemas/newsletterSchemas.js";

const router = express.Router();

// router.post("/subscribe", newsletterController.subscribe);
// router.post("/send", protect, isAdmin, newsletterController.sendNewsletter);
router.post(
  "/subscribe",
  validateBody(subscribeNewsletterSchema),
  newsletterController.subscribe
);
router.post(
  "/send",
  protect,
  isAdmin,
  validateBody(sendNewsletterSchema),
  newsletterController.sendNewsletter
);

export default router;