import express from "express";
import authController from "../controllers/authController.js";
import { validateBody } from "../middleware/validateBody.js";
import { authRegisterSchema, authLoginSchema } from "../schemas/authSchema.js";
import { protect } from "../middleware/authMiddleware.js";
import { googleAuth } from "../controllers/googleAuthController.js";
import { authLimiter } from "../middleware/authLimiter.js";
import verifyCodeController from "../controllers/verifyCodeController.js";
import codeController from "../controllers/requestCodeController.js";
import resetPasswordController from "../controllers/resetPasswordController.js";
import { refreshSession } from "../controllers/refreshController.js";
import { googleAuthSchema } from "../schemas/googleAuthSchema.js";
import {
  requestLoginCodeSchema,
  verifyLoginCodeSchema,
} from "../schemas/loginCodeSchemas.js";
import { passwordResetSchema } from "../schemas/passwordResetSchema.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validateBody(authRegisterSchema),
  authController.registerUser
);

router.post(
  "/login",
  authLimiter,
  validateBody(authLoginSchema),
  authController.loginUser
);

router.post("/logout", authController.logoutUser);
router.get("/me", protect, authController.getCurrentUser);
router.post("/google", validateBody(googleAuthSchema), googleAuth);
router.post(
  "/request-code",
  authLimiter,
  validateBody(requestLoginCodeSchema),
  codeController.requestLoginCode
);
router.post(
  "/verify-code",
  authLimiter,
  validateBody(verifyLoginCodeSchema),
  verifyCodeController.verifyCode
);

router.patch(
  "/reset-password",
  protect,
  authLimiter,
  validateBody(passwordResetSchema),
  resetPasswordController.resetPassword
);

router.post("/refresh", refreshSession);

export default router;
