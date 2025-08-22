import LoginCode from "../models/LoginCode.js";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { sendEmail } from "../services/emailService.js";
import sendResponse from "../utils/sendResponse.js";
import { nanoid } from "nanoid";
import { sequelize } from "../config/db.js";

const requestLoginCode = async (req, res) => {
  const rawEmail = req.body?.email || "";
  const email = rawEmail.trim().toLowerCase();
  if (!email) throw HttpError(400, "Email is required");

  const user = await User.findOne({ where: { email } });
  if (!user) throw HttpError(404, "User not found");

   // 🧠 Визначаємо тип коду:
  const isNewUser = !user.isEmailVerified;
  const code = isNewUser
    ? nanoid(6).toUpperCase()
    : Math.floor(100000 + Math.random() * 900000).toString();

  const CODE_TTL_MS = 10 * 60 * 1000;
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  // 💾 Атомарно: видаляємо старі коди й створюємо новий у межах транзакції
  await sequelize.transaction(async (t) => {
    await LoginCode.destroy({ where: { email }, transaction: t });
    await LoginCode.create({ email, code, expiresAt }, { transaction: t });
  });

  const subject = isNewUser ? "Confirm your email" : "Your login code";
  const body = isNewUser
    ? `<p>Your confirmation code is: <strong>${code}</strong></p>`
    : `<p>Your login code is: <strong>${code}</strong></p>`;

  // ✉️ Надсилаємо
  try {
    await sendEmail(email, subject, body);
  } catch (e) {
    console.error("Email send failed:", e.message);
    // все одно відповідаємо 200
  }

  sendResponse(res, {
    code: 200,
    message: "Verification code sent to your email",
  });
};

export default {
  requestLoginCode: ctrlWrapper(requestLoginCode),
};
