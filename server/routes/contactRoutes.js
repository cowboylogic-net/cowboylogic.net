// server/routes/contactRoutes.js
import express from "express";
import contactController from "../controllers/contactController.js";
import { validateBody } from "../middleware/validateBody.js";
import { contactSchema } from "../schemas/contactSchema.js";

const router = express.Router();

router.post("/", validateBody(contactSchema), contactController.sendContactEmail);

export default router;
