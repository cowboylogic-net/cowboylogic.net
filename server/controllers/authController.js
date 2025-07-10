import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import User from "../models/User.js";
import LoginCode from "../models/LoginCode.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { sendEmail } from "../services/emailService.js";
import { formatUser } from "../utils/formatUser.js";
import PartnerProfile from "../models/PartnerProfile.js";
import { sequelize } from "../config/db.js";
import "../models/index.js"; // 👈 це гарантовано триггерить асоціації


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

const registerUser = async (req, res) => {
  const {
    email,
    password,
    role,
    fullName,
    phoneNumber,
    newsletter,
    heardAboutUs,
    partnerProfile,
  } = req.body;

  // 1. Перевірка на існуючого юзера
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
    const code = nanoid(6).toUpperCase();
    await LoginCode.create({
      email: newUser.email,
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 хв
    });

    await transaction.commit(); // завершення всіх записів

    try {
      await sendEmail(
        newUser.email,
        "Confirm your email",
        `<p>Your confirmation code is: <strong>${code}</strong></p>`
      );
    } catch (emailErr) {
      console.error("❌ Email failed post-commit:", emailErr.message);
      // 🔁 Можна зберегти цей код в чергу для повторного надсилання
    }

    // 10. Повернення юзера з профілем
    const userWithProfile = await User.findByPk(newUser.id, {
      include: [{ association: "partnerProfile", required: false }],
    });

    console.log("✅ userWithProfile = ", userWithProfile); // ⬅⬅⬅ ось тут
    // 11. Відповідь
    // res.status(201).json({
    //   token: generateToken(newUser),
    //   user: formatUser(userWithProfile),
    // });
    try {
      res.status(201).json({
        token: generateToken(newUser),
        user: formatUser(userWithProfile),
      });
    } catch (err) {
      console.error("❌ res.status JSON error:", err.message, err.stack);
      res.status(500).json({ message: "Error serializing user" });
    }
  } catch (error) {
    console.error("❌ registerUser error:", error.message, error.stack); // ← додай
    await transaction.rollback();
    throw error;
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) throw HttpError(401, "Invalid credentials");

  if (!user.isEmailVerified) {
    throw HttpError(403, "Please verify your email before logging in");
  }

  if (!user.password) {
    throw HttpError(400, "Please login via Google");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw HttpError(401, "Invalid credentials");

  const token = generateToken(user);

  res.json({
    token,
    user: formatUser(user),
  });
};

const logoutUser = async (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

const getCurrentUser = async (req, res) => {
  // ⛔ req.user може бути "спрощеним", без avatarURL
  const freshUser = await User.findByPk(req.user.id);
  res.json(formatUser(freshUser));
};

export default {
  registerUser: ctrlWrapper(registerUser),
  loginUser: ctrlWrapper(loginUser),
  logoutUser: ctrlWrapper(logoutUser),
  getCurrentUser: ctrlWrapper(getCurrentUser),
};
