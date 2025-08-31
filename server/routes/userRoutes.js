import express from "express";
import { protect, isAdminOrSuperAdmin } from "../middleware/authMiddleware.js";
import userController from "../controllers/userController.js";
import logSuperAdminAccess from "../middleware/logSuperAdminAccess.js";
import { validateBody } from "../middleware/validateBody.js";
import { userRoleSchema } from "../schemas/userRoleSchema.js";
import { validateParams } from "../middleware/validateParams.js";
import { idParamSchema } from "../schemas/paramsSchemas.js";

const router = express.Router();

// 🔐 Спершу захист, потім логування
router.use(protect, isAdminOrSuperAdmin, logSuperAdminAccess);

router.get("/", userController.getAllUsers);

router.patch(
  "/:id/role",
  validateParams(idParamSchema),
  validateBody(userRoleSchema),
  userController.updateUserRole
);
router.delete("/:id", validateParams(idParamSchema), userController.deleteUser);

export default router;
