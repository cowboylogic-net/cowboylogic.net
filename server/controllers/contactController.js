import nodemailer from "nodemailer";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendResponse from "../utils/sendResponse.js";
import dotenv from "dotenv";
dotenv.config();

// Визначаємо secure за портом: 465 -> SSL, інакше STARTTLS
const PORT = Number(process.env.MAIL_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: PORT,
  secure: PORT === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendContactEmail = async (req, res) => {
  const { firstName, lastName, email, message, comment } = req.body;

  // приймаємо і message, і comment (щоб не ламалось, якщо фронт/схема різняться)
  const body = (message ?? comment ?? "").toString();

  const fromName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Contact Form";

  const mailOptions = {
    from: `"${fromName}" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_ADMIN,
    replyTo: email,
    subject: "New Contact Form Submission",
    html: `
      <p><strong>Name:</strong> ${fromName}</p>
      <p><strong>Email:</strong> ${email || "-"}</p>
      <p><strong>Message:</strong></p>
      <p>${body}</p>
    `,
  };

  await transporter.sendMail(mailOptions);

  sendResponse(res, {
    code: 200,
    message: "Message sent successfully",
  });
};

export default {
  sendContactEmail: ctrlWrapper(sendContactEmail),
};
