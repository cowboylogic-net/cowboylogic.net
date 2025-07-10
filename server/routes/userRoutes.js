import express from "express";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";
import userController from "../controllers/userController.js";
import logSuperAdminAccess from "../middleware/logSuperAdminAccess.js";
import { validateBody } from "../middleware/validateBody.js";
import { userRoleSchema } from "../schemas/userRoleSchema.js";

const router = express.Router();

// 🔐 Спершу захист, потім логування
router.use(protect, isSuperAdmin, logSuperAdminAccess);

router.get("/", userController.getAllUsers);
// router.patch("/:id/role", userController.updateUserRole);
router.patch(
  "/:id/role",
  validateBody(userRoleSchema),
  userController.updateUserRole
);
router.delete("/:id", userController.deleteUser);

export default router;
