import bcrypt from "bcryptjs";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { sendEmail } from "../services/emailService.js";
import sendResponse from "../utils/sendResponse.js";

const resetPassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  const user = await User.unscoped().findByPk(userId);
  if (!user) throw HttpError(404, "User not found");

  // Якщо акаунт створений через Google і пароля немає — забороняємо локальний ресет
  if (!user.password) {
    throw HttpError(400, "Password reset is unavailable for Google accounts");
  }

  // Заборонити ставити такий самий пароль
  if (oldPassword === newPassword) {
    throw HttpError(400, "New password must be different from the old one");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw HttpError(401, "Old password is incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  user.tokenVersion++; // Invalidate all previous tokens
  await user.save();

  // ✅ Надсилаємо email-підтвердження про зміну паролю
  try {
    await sendEmail(
      user.email,
      "Your password has been changed",
      `<p>Hello,</p>
       <p>This is a confirmation that the password for your account <strong>${user.email}</strong> was just changed.</p>
       <p>If you did not request this, please contact us immediately.</p>`
    );
  } catch (e) {
    // Лог і продовжуємо — пароль уже змінено й токени інвалідовано
    console.error("Password change email failed:", e.message);
  }

  sendResponse(res, {
    code: 200,
    message: "Password updated successfully",
  });
};

export default {
  resetPassword: ctrlWrapper(resetPassword),
};
