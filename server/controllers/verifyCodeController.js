import LoginCode from "../models/LoginCode.js";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import jwt from "jsonwebtoken";
import { setRefreshCookie } from "../utils/cookies.js";
import { formatUser } from "../utils/formatUser.js";
import sendResponse from "../utils/sendResponse.js";
import { Op } from "sequelize";

const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "7", 10);

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
  const rawEmail = req.body?.email || "";
  const rawCode = String(req.body?.code ?? "");
  const email = rawEmail.trim().toLowerCase();
  const code = rawCode.trim().toUpperCase();
  if (!email || !code) throw HttpError(400, "Email and code are required");

  // 🔐 Атомарна перевірка: видалимо рівно 1 валідний (не прострочений) код.
  const destroyed = await LoginCode.destroy({
    where: {
      email,
      code,
      expiresAt: { [Op.gt]: new Date() },
    },
  });
  if (!destroyed) {
    throw HttpError(400, "Invalid or expired verification code");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) throw HttpError(404, "User not found");

  if (!user.isEmailVerified) {
    user.isEmailVerified = true;
    await user.save();
  }

  // 🕒 оновлюємо мітку останнього входу (не ламає, навіть якщо колонки ще нема)
  try {
    await user.update({ lastLoginAt: new Date() });
  } catch (_) {}

  // 🔐 Генеруємо токен
  const token = jwt.sign(
    {
      id: user.id,
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
      tv: user.tokenVersion || 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
  const refresh = jwt.sign(
    { sub: user.id, tv: user.tokenVersion || 0, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: `${REFRESH_DAYS}d` }
  );
  setRefreshCookie(res, refresh, req);

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
