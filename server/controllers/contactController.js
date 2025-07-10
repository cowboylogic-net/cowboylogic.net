import nodemailer from "nodemailer";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: true, // true для порту 465 (SSL)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendContactEmail = async (req, res) => {
  const { firstName, lastName, email, comment } = req.body;

  const mailOptions = {
    from: `"${firstName} ${lastName}" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_ADMIN,
    replyTo: email,
    subject: "New Contact Form Submission",
    html: `
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${comment}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  res.json({ message: "Message sent successfully" });
};

export default {
  sendContactEmail: ctrlWrapper(sendContactEmail),
};
