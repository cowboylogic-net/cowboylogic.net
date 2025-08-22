import express from "express";
import ctrl from "../controllers/newsletterController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { subscribeSchema, sendSchema } from "../schemas/newsletterSchemas.js";

const router = express.Router();

// публічна підписка
router.post("/subscribe", validateBody(subscribeSchema), ctrl.subscribe);

// розсилка — тільки адміни
router.post(
  "/send",
  protect,
  requireRole("admin", "superAdmin"),
  validateBody(sendSchema),
  ctrl.sendNewsletter
);

router.post("/unsubscribe", validateBody(subscribeSchema), ctrl.unsubscribe);

export default router;
