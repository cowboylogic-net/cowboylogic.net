import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import { convert } from "html-to-text"; // 👈 для генерації text-версії з HTML (потрібно `npm i html-to-text`)

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // smtp.mailgun.org
  port: Number(process.env.MAIL_PORT), // 587
  secure: false, // для STARTTLS через порт 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  const text = convert(html, {
    wordwrap: 130,
  });

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  };

  console.log("📨 Sending email to:", to, "via", transporter.options.host, "port:", transporter.options.port);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response || info.messageId);
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    throw new Error("Email send failed: " + err.message);
  }
};

export const sendContactEmail = async ({ firstName, lastName, email, comment }) => {
  const html = `
    <h3>New message from ${firstName} ${lastName}</h3>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong><br/>${comment}</p>
  `;
  await sendEmail(process.env.EMAIL_ADMIN, "New Contact Form Submission", html);
};

export const sendOrderConfirmationEmail = async ({ to, order, items }) => {
  const itemList = items
    .map(item => `<li>${item.quantity} × ${item.Book.title} @ $${item.Book.price}</li>`)
    .join("");

  const html = `
    <h2>Thank you for your order!</h2>
    <p>Your order <strong>#${order.id}</strong> has been confirmed.</p>
    <h3>Order Details:</h3>
    <ul>${itemList}</ul>
    <p><strong>Total:</strong> $${order.totalPrice}</p>
  `;

  await sendEmail(to, "Your Order Confirmation", html);
};
