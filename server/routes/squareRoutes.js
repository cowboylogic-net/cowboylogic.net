import express from "express";
import { createPayment } from "../controllers/squareController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-payment", protect, createPayment);

export default router;
