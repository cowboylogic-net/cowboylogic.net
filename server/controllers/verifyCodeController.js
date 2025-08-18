import LoginCode from "../models/LoginCode.js";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import jwt from "jsonwebtoken";
import { formatUser } from "../utils/formatUser.js";
import sendResponse from "../utils/sendResponse.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  const loginCode = await LoginCode.findOne({
    where: { email, code: code.toUpperCase() },
  });

  if (!loginCode || new Date() > loginCode.expiresAt) {
    throw HttpError(400, "Invalid or expired verification code");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) throw HttpError(404, "User not found");

  // Видаляємо використаний код
  await loginCode.destroy();

  if (!user.isEmailVerified) {
    user.isEmailVerified = true;
    await user.save();
  }

  // 🔐 Генеруємо токен
  const token = generateToken(user);

  sendResponse(res, {
    code: 200,
    message: "Verification successful",
    data: {
      token,
      user: formatUser(user),
    },
  });
};

export default {
  verifyCode: ctrlWrapper(verifyCode),
};
