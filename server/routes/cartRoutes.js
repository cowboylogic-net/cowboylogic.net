import express from "express";
import cartController from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateParams } from "../middleware/validateParams.js"; // ⬅️ INSERT
import { cartItemIdParamSchema } from "../schemas/paramsSchemas.js";

const router = express.Router();

router.use(protect);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);

router.patch(
  "/:itemId",
  validateParams(cartItemIdParamSchema),
  cartController.updateQuantity
);
router.delete(
  "/:itemId",
  validateParams(cartItemIdParamSchema),
  cartController.deleteItem
);

router.delete("/", cartController.clearCart);

export default router;
