import express from "express";
import { createPaymentLink } from "../controllers/squareController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-payment", protect, createPaymentLink);

export default router;
