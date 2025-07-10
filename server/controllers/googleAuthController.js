import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import { formatUser } from "../utils/formatUser.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    throw HttpError(400, "No id_token provided");
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    throw HttpError(401, "Invalid Google token");
  }

  const payload = ticket.getPayload();
  const { email, name } = payload;

  let user = await User.findOne({ where: { email } });

  if (!user) {
    // 🆕 Створення нового користувача з Google
    user = await User.create({
      fullName: name || "Google User",
      email,
      password: null,
      role: "user",
      isEmailVerified: true,
    });
  } else {
    // 🔒 Перевірка: якщо user має пароль — не дозволяти Google Login
    if (user.password) {
      throw HttpError(400, "This email is registered with a password. Please login with email and password.");
    }

    // 🟢 Якщо Google user — ensure isEmailVerified true
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save(); // оновлюємо флаг
    }
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: formatUser(user),
  });
};
