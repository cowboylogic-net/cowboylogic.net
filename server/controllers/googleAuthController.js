// server/controllers/googleAuthController.js
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import { formatUser } from "../utils/formatUser.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendResponse from "../utils/sendResponse.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = ctrlWrapper(async (req, res) => {
  const { id_token } = req.body;

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
  const name = payload.name;
  const email = String(payload.email || "")
    .trim()
    .toLowerCase(); // ✅ нормалізація

  let user = await User.findOne({ where: { email } }); // ⬅️ прибрати зайвий символ після цього рядка

  if (!user) {
    user = await User.create({
      fullName: name || "Google User",
      email,
      password: null,
      role: "user",
      isEmailVerified: true,
    });
  } else {
    if (user.password) {
      throw HttpError(
        400,
        "This email is registered with a password. Please login with email and password."
      );
    }
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }
  }

  const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";
  const token = jwt.sign(
    { id: user.id, role: user.role, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: EXPIRES }
  );

  sendResponse(res, {
    code: 200,
    data: { token, user: formatUser(user) },
  });
});
