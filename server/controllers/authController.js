import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import User from "../models/User.js";
import LoginCode from "../models/LoginCode.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { sendEmail } from "../services/emailService.js";
import { formatUser } from "../utils/formatUser.js";

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
  const { email, password, role } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw HttpError(409, "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    email,
    password: hashedPassword,
    role: role || "user",
  });

  const token = generateToken(newUser);

  res.status(201).json({
    token,
    user: formatUser(newUser),
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) throw HttpError(401, "Invalid credentials");

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
