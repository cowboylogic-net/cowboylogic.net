// server/services/mailer.js
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import { convert } from "html-to-text";

// ---- Transporter ----
const PORT = Number(process.env.MAIL_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,           // напр. smtp.mailgun.org / smtp.office365.com / smtp.gmail.com
  port: PORT,                            // 465 (SSL) або 587 (STARTTLS)
  secure: PORT === 465,                  // авто-визначення SSL
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  logger: process.env.MAIL_DEBUG === "1",
  debug: process.env.MAIL_DEBUG === "1",
});

// опційно: швидка перевірка транспорту
export const verifySMTP = async () => transporter.verify();

// ---- Base sender ----
export const sendEmail = async (to, subject, html, { replyTo } = {}) => {
  const text = convert(html || "", { wordwrap: 130 });

  const fromName  = process.env.MAIL_FROM_NAME  || "No-Reply";
  const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  };

  console.log("📨 Sending email to:", to, "via", transporter.options.host, "port:", transporter.options.port);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response || info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    throw new Error("Email send failed: " + err.message);
  }
};

// ---- Contact email ----
export const sendContactEmail = async ({ firstName, lastName, email, message, comment }) => {
  const body = (message ?? comment ?? "").toString();
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Contact Form";

  const adminRecipient = process.env.MAIL_ADMIN || process.env.EMAIL_ADMIN;
  if (!adminRecipient) {
    throw new Error("EMAIL_ADMIN/MAIL_ADMIN env is missing");
  }

  const html = `
    <h3>New message from ${name}</h3>
    <p><strong>Email:</strong> ${email || "-"}</p>
    <p><strong>Message:</strong><br/>${body}</p>
  `;

  await sendEmail(adminRecipient, "New Contact Form Submission", html, { replyTo: email });
};

// ---- Order confirmation ----
export const sendOrderConfirmationEmail = async ({ to, order, items }) => {
  const itemList = (items || [])
    .map((item) => {
      const title = item?.Book?.title ?? "Item";
      // якщо для партнера в item.Book є partnerPrice — беремо його, інакше price
      const unitPrice = Number(
        item?.Book?.partnerPrice ?? item?.Book?.price ?? 0
      ).toFixed(2);
      const qty = Number(item?.quantity ?? 0);
      return `<li>${qty} × ${title} @ $${unitPrice}</li>`;
    })
    .join("");

  const total = Number(order?.totalPrice ?? 0).toFixed(2);

  const html = `
    <h2>Thank you for your order!</h2>
    <p>Your order <strong>#${order?.id ?? "-"}</strong> has been confirmed.</p>
    <h3>Order Details:</h3>
    <ul>${itemList}</ul>
    <p><strong>Total:</strong> $${total}</p>
  `;

  await sendEmail(to, "Your Order Confirmation", html);
};
