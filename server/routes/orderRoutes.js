import express from "express";
import orderController from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateBody } from "../middleware/validateBody.js";
import { idParamSchema } from "../schemas/paramsSchemas.js";
import { updateOrderStatusSchema } from "../schemas/orderSchemas.js";

const router = express.Router();

// усі маршрути захищені
router.use(protect);

// створити ордер з кошика
router.post("/", orderController.createOrder);

// мої ордери (user)
router.get("/", orderController.getUserOrders);

// останній ордер користувача (user)
router.get("/latest", orderController.getLatestOrder);

// підтвердження ордера після Square (user)
router.post("/confirm", orderController.confirmSquareOrder);

// усі ордери (admin/superAdmin)
router.get("/all", requireRole("admin", "superAdmin"), orderController.getAllOrders);

// оновити статус (admin/superAdmin)
router.patch(
  "/:id/status",
  requireRole("admin", "superAdmin"),
  validateParams(idParamSchema),
  validateBody(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

// видалити ордер (admin/superAdmin)
router.delete(
  "/:id",
  requireRole("admin", "superAdmin"),
  validateParams(idParamSchema),
  orderController.deleteOrder
);

export default router;
