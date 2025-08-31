import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import { convert } from "html-to-text";

const PORT = Number(process.env.MAIL_PORT) || 587;
const IS_SECURE = PORT === 465;
const IS_PROD = (process.env.NODE_ENV || "").toLowerCase() === "production";
const REDIRECT_ALL_TO = process.env.MAIL_REDIRECT_ALL_TO || "";

// --- helpers ---
const safe = (v) => String(v ?? "").trim();

const escapeHtml = (str) =>
  safe(str).replace(/[&<>"'`=\/]/g, (s) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "/": "&#x2F;", "`": "&#x60;", "=": "&#x3D;" }[s])
  );

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safe(s));
const resolveRecipient = (to) => (!IS_PROD && REDIRECT_ALL_TO ? REDIRECT_ALL_TO : to);

// --- transporter ---
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: PORT,
  secure: IS_SECURE,           // 465 = SSL
  requireTLS: !IS_SECURE,      // 587 -> STARTTLS обов’язково
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 50,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
  tls: { minVersion: "TLSv1.2" },
  logger: process.env.MAIL_DEBUG === "1",
  debug: process.env.MAIL_DEBUG === "1",
});

export const verifySMTP = async () => transporter.verify();

// --- base sender ---
export const sendEmail = async (toRaw, subjectRaw, htmlRaw, { replyTo } = {}) => {
  const toOriginal = safe(toRaw);
  const to = resolveRecipient(toOriginal);

  const subject = safe(subjectRaw);
  const html = safe(htmlRaw);
  const text = convert(html || "", { wordwrap: 130 });

  const fromName = safe(process.env.MAIL_FROM_NAME || "No-Reply");
  const fromEmail = safe(process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER);

  const headers = {
    "X-App": "CowboyLogic",
    "X-Env": process.env.NODE_ENV || "development",
  };

  if (!IS_PROD && REDIRECT_ALL_TO) {
    headers["X-Original-To"] = toOriginal || "(empty)";
  }

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
    text,
    headers,
    ...(replyTo && isEmail(replyTo) ? { replyTo: safe(replyTo) } : {}),
  };

  console.log(
    "📨 Sending email:",
    { to: mailOptions.to, subject: mailOptions.subject, env: process.env.NODE_ENV || "dev" },
    "via",
    transporter.options.host,
    "port:",
    transporter.options.port
  );

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response || info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email send error:", err?.message || err);
    throw new Error("Email send failed: " + (err?.message || String(err)));
  }
};

// --- contact email ---
export const sendContactEmail = async ({ firstName, lastName, email, message, comment }) => {
  const body = safe(message ?? comment);
  const name = safe(`${safe(firstName)} ${safe(lastName)}`) || "Contact Form";

  const adminRecipient = safe(process.env.MAIL_ADMIN || process.env.EMAIL_ADMIN);
  if (!adminRecipient) throw new Error("EMAIL_ADMIN/MAIL_ADMIN env is missing");

  const html = `
    <h3>New message from ${escapeHtml(name)}</h3>
    <p><strong>Email:</strong> ${escapeHtml(email || "-")}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;margin:0">${escapeHtml(body)}</pre>
  `;

  await sendEmail(adminRecipient, "New Contact Form Submission", html, {
    replyTo: isEmail(email) ? safe(email) : undefined,
  });
};

// --- order confirmation ---
export const sendOrderConfirmationEmail = async ({ to, order, items }) => {
  const itemList = (items || [])
    .map((item) => {
      const title = escapeHtml(item?.Book?.title ?? item?.title ?? "Item");
      const unit = item?.Book?.partnerPrice ?? item?.Book?.price ?? item?.price ?? 0;
      const unitPrice = Number(unit).toFixed(2);
      const qty = Number(item?.quantity ?? 0);
      return `<li>${qty} × ${title} @ $${unitPrice}</li>`;
    })
    .join("");

  const total = Number(order?.totalPrice ?? 0).toFixed(2);
  const orderId = escapeHtml(order?.id ?? "-");

  const html = `
    <h2>Thank you for your order!</h2>
    <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
    <h3>Order Details:</h3>
    <ul>${itemList}</ul>
    <p><strong>Total:</strong> $${total}</p>
  `;

  await sendEmail(to, "Your Order Confirmation", html);
};
