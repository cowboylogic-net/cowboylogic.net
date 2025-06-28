// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import HttpError from "../helpers/HttpError.js";
// import ctrlWrapper from "../helpers/ctrlWrapper.js";
// import LoginCode from "../models/LoginCode.js";
// import { sendEmail } from "../services/emailService.js";
// import { nanoid } from "nanoid";

// const generateToken = (user) => {
//   return jwt.sign(
//     {
//       id: user.id,
//       role: user.role,
//       tokenVersion: user.tokenVersion, // ✅ додаємо версію
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
//   );
// };

// const registerUser = async (req, res) => {
//   const { email, password, role } = req.body;

//   const existingUser = await User.findOne({ where: { email } });
//   if (existingUser) throw HttpError(409, "User already exists");

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const newUser = await User.create({
//     email,
//     password: hashedPassword,
//     role: role || "user",
//   });

//   const token = generateToken(newUser);

//   res.status(201).json({
//     token,
//     user: {
//       id: newUser.id,
//       email: newUser.email,
//       role: newUser.role,
//     },
//   });
// };

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ where: { email } });
//   if (!user) throw HttpError(401, "Invalid credentials");

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) throw HttpError(401, "Invalid credentials");

//   const token = generateToken(user);

//   res.json({
//     token,
//     user: {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     },
//   });
// };

// const logoutUser = async (req, res) => {
//   res.clearCookie("token"); // або просто повідомлення, якщо localStorage
//   res.json({ message: "Logged out successfully" });
// };

// const getCurrentUser = async (req, res) => {
//   res.json(req.user);
// };

// export const requestCode = async (req, res) => {
//   const { email } = req.body;

//   const user = await User.findOne({ where: { email } });
//   if (!user) throw HttpError(404, "User not found");

//   const code = nanoid(6);
//   const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 хвилин
//   await LoginCode.destroy({ where: { email } });
//   await LoginCode.create({ email, code, expiresAt });

//   const html = `
//     <div style="font-family: sans-serif; line-height: 1.5; font-size: 16px;">
//       <p>Hello,</p>
//       <p>Your login verification code is:</p>
//       <h2 style="color: #333;">${code}</h2>
//       <p>This code will expire in 5 minutes.</p>
//     </div>
//   `;

//   await sendEmail(email, "Your CLP verification code", html);

//   res.json({ message: "Verification code sent" });
// };

// export const verifyCode = async (req, res) => {
//   const { email, code } = req.body;

//   const record = await LoginCode.findOne({ where: { email, code } });
//   if (!record) throw HttpError(400, "Invalid code");

//   const user = await User.findOne({ where: { email } });
//   if (!user) throw HttpError(404, "User not found");

//   const token = generateToken(user);
//   await record.destroy();

//   res.json({
//     token,
//     user: {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     },
//   });
// };

// export default {
//   registerUser: ctrlWrapper(registerUser),
//   loginUser: ctrlWrapper(loginUser),
//   logoutUser: ctrlWrapper(logoutUser),
//   getCurrentUser: ctrlWrapper(getCurrentUser),
// };
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import User from "../models/User.js";
import LoginCode from "../models/LoginCode.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { sendEmail } from "../services/emailService.js";

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
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    },
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
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
};

const logoutUser = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

const getCurrentUser = async (req, res) => {
  res.json(req.user);
};

export const requestCode = async (req, res) => {
  const { email } = req.body;
  console.log("📬 Backend: requested code for", email);

  const user = await User.findOne({ where: { email } });
  if (!user) throw HttpError(404, "User not found");

  const code = nanoid(6);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await LoginCode.create({ email, code, expiresAt });

  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; font-size: 16px;">
      <p>Hello,</p>
      <p>Your login verification code is:</p>
      <h2 style="color: #333;">${code}</h2>
      <p>This code will expire in 5 minutes.</p>
    </div>
  `;

  await sendEmail(email, "Your CLP verification code", html);
  res.json({ message: "Verification code sent" });
};

export const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  const record = await LoginCode.findOne({ where: { email, code } });
  if (!record) throw HttpError(400, "Invalid code");

  const user = await User.findOne({ where: { email } });
  if (!user) throw HttpError(404, "User not found");

  const token = generateToken(user);
  await record.destroy();

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
};

export default {
  registerUser: ctrlWrapper(registerUser),
  loginUser: ctrlWrapper(loginUser),
  logoutUser: ctrlWrapper(logoutUser),
  getCurrentUser: ctrlWrapper(getCurrentUser),
};
