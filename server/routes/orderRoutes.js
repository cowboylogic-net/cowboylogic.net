import express from "express";
import orderController from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", orderController.createOrder);
router.get("/", orderController.getUserOrders); 
router.get("/all", orderController.getAllOrders); 
router.patch("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);
router.get("/latest", orderController.getLatestOrder); 


router.post("/confirm", orderController.confirmSquareOrder);


export default router;
