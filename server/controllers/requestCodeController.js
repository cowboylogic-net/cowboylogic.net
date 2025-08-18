import LoginCode from "../models/LoginCode.js";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { sendEmail } from "../services/emailService.js";
import sendResponse from "../utils/sendResponse.js";
import { nanoid } from "nanoid";

const requestLoginCode = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) throw HttpError(404, "User not found");

  // 🧹 Видаляємо попередні коди
  await LoginCode.destroy({ where: { email } });

  // 🧠 Визначаємо тип коду:
  const isNewUser = !user.isEmailVerified;
  const code = isNewUser
    ? nanoid(6).toUpperCase() // Буквенно-цифровий для реєстрації
    : Math.floor(100000 + Math.random() * 900000).toString(); // Цифровий для логіну

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 хв

  // 💾 Зберігаємо
  await LoginCode.create({ email, code, expiresAt });

  const subject = isNewUser ? "Confirm your email" : "Your login code";
  const body = isNewUser
    ? `<p>Your confirmation code is: <strong>${code}</strong></p>`
    : `Your login code is: ${code}`;

  // ✉️ Надсилаємо
  await sendEmail(email, subject, body);

  sendResponse(res, {
    code: 200,
    message: "Verification code sent to your email",
  });
};

export default {
  requestLoginCode: ctrlWrapper(requestLoginCode),
};
