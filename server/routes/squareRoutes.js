import express from 'express';
import { createPaymentLink } from '../controllers/squareController.js';
import { protect } from '../middleware/authMiddleware.js'; // ✅ Імпортуємо middleware

const router = express.Router();

// ✅ Додаємо захист маршруту
router.post('/create-payment', protect, createPaymentLink);

export default router;
