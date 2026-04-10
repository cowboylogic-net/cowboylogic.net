import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User from "../models/User.js";
import LoginCode from "../models/LoginCode.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { sendEmail } from "../services/emailService.js";
import { formatUser } from "../utils/formatUser.js";
import PartnerProfile from "../models/PartnerProfile.js";
import { sequelize } from "../config/db.js";
import sendResponse from "../utils/sendResponse.js";
import { setRefreshCookie, clearRefreshCookie } from "../utils/cookies.js";
import { generateOtpCode } from "../utils/otp.js";

const ACCESS_MIN = parseInt(process.env.ACCESS_TOKEN_TTL_MIN || "15", 10);
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "7", 10);

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id, // для зворотної сумісності
      sub: user.id, // сучасне поле
      role: user.role,
      tokenVersion: user.tokenVersion,
      tv: user.tokenVersion || 0, // коротке поле для refresh-сумісності
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const registerUser = async (req, res) => {
  const {
    email: rawEmail,
    password,
    role,
    fullName,
    phoneNumber,
    newsletter,
    heardAboutUs,
    partnerProfile,
  } = req.body;

  // 0) Нормалізуємо email
  const email = (rawEmail || "").trim().toLowerCase();
  if (!email) throw HttpError(400, "Email is required");

  // 1) Перевірка на існуючого юзера
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw HttpError(409, "User already exists");

  // 2. 🔐 Визначення ролі (тільки user або partner)
  let finalRole = "user";
  if (role === "partner") {
    finalRole = "partner";
  } else if (role && role !== "user") {
    throw HttpError(403, "You cannot assign this role");
  }

  // 3. Починаємо транзакцію
  const transaction = await sequelize.transaction();

  try {
    // 4. Хешування паролю
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Створення користувача
    const newUser = await User.create(
      {
        email,
        password: hashedPassword,
        role: finalRole,
        fullName,
        phoneNumber,
        newsletter: newsletter || false,
        heardAboutUs,
        gdprConsentAt: new Date(), // ✅ timestamp
      },
      { transaction }
    );

    // 6. Створення профілю партнера, якщо треба
    if (finalRole === "partner" && partnerProfile) {
      await PartnerProfile.create(
        {
          userId: newUser.id,
          ...partnerProfile,
        },
        { transaction }
      );
    }

    // 7. Створення коду підтвердження email
    try {
      await LoginCode.destroy({
        where: { email, expiresAt: { [Op.lt]: new Date() } },
        transaction,
      });
    } catch (_) {}

    const code = generateOtpCode();
    await LoginCode.create(
      {
        email: newUser.email,
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 хв
      },
      { transaction }
    );

    await transaction.commit(); // завершення всіх записів

    try {
      await sendEmail(
        newUser.email,
        "Confirm your email",
        `<p>Your confirmation code is: <strong>${code}</strong></p>`
      );
    } catch (emailErr) {
      console.error("❌ Email failed post-commit:", emailErr.message);
      //  Можна зберегти цей код в чергу для повторного надсилання
    }

    // 10. Повернення юзера з профілем
    const userWithProfile = await User.findByPk(newUser.id, {
      include: [{ association: "partnerProfile", required: false }],
    });

    return sendResponse(res, {
      code: 201,
      data: {
        token: generateToken(newUser),
        user: formatUser(userWithProfile),
      },
    });
  } catch (error) {
    console.error("❌ registerUser error:", error.message, error.stack);
    await transaction.rollback();
    throw error;
  }
};

const loginUser = async (req, res) => {
  const { email: rawEmail, password } = req.body;
  const email = (rawEmail || "").trim().toLowerCase();

  const user = await User.unscoped().findOne({ where: { email } });
  if (!user) throw HttpError(401, "Invalid credentials");

  if (!user.isEmailVerified) {
    throw HttpError(403, "Please verify your email before logging in");
  }

  if (!user.password) {
    throw HttpError(400, "Please login via Google");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw HttpError(401, "Invalid credentials");

  try {
    await user.update({ lastLoginAt: new Date() });
  } catch (_) {}

  const token = generateToken(user);
  // refresh-cookie (httpOnly)
  const refresh = jwt.sign(
    { sub: user.id, tv: user.tokenVersion || 0, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: `${REFRESH_DAYS}d` }
  );
  setRefreshCookie(res, refresh, req);

  sendResponse(res, {
    code: 200,
    data: {
      token,
      user: formatUser(user),
    },
  });
};

const logoutUser = async (req, res) => {
  clearRefreshCookie(res);
  sendResponse(res, {
    code: 200,
    message: "Logged out successfully",
  });
};

const getCurrentUser = async (req, res) => {
  const freshUser = await User.findByPk(req.user.id, {
    include: [{ association: "partnerProfile", required: false }],
  });
  if (!freshUser) throw HttpError(401, "User not found");

  sendResponse(res, {
    code: 200,
    data: formatUser(freshUser),
  });
};

export default {
  registerUser: ctrlWrapper(registerUser),
  loginUser: ctrlWrapper(loginUser),
  logoutUser: ctrlWrapper(logoutUser),
  getCurrentUser: ctrlWrapper(getCurrentUser),
};
