import express from "express";
import authController from "../controllers/authController.js";
import { validateBody } from "../middleware/validateBody.js";
import {
  authRegisterSchema,
  authLoginSchema,
} from "../schemas/authSchema.js";
import { protect } from "../middleware/authMiddleware.js";
import { googleAuth } from "../controllers/googleAuthController.js";
import { authLimiter } from "../middleware/authLimiter.js";
import verifyCodeController from "../controllers/verifyCodeController.js";
import codeController from "../controllers/requestCodeController.js"; 
import resetPasswordController from "../controllers/resetPasswordController.js";


const router = express.Router();

router.post(
  "/register",
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
router.post("/google", googleAuth);
router.post("/request-code", codeController.requestLoginCode);
router.post("/verify-code", verifyCodeController.verifyCode);


router.patch("/reset-password", protect, resetPasswordController.resetPassword);


export default router;
