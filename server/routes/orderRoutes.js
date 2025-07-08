import express from "express";
import orderController from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", orderController.createOrder);
router.get("/", orderController.getUserOrders); // user: /orders
router.get("/all", orderController.getAllOrders); // admin only
router.patch("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);
router.get("/latest", orderController.getLatestOrder); // ✅ latest order


router.post("/confirm", orderController.confirmSquareOrder);


export default router;
