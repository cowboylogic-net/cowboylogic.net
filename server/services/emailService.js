import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import { convert } from "html-to-text";

const safe = (v) => String(v ?? "").trim();

const IS_PROD = safe(process.env.NODE_ENV).toLowerCase() === "production";
const REDIRECT_ALL_TO = safe(process.env.MAIL_REDIRECT_ALL_TO || "");

// Mailgun (needed early so we can default provider safely)
const MAILGUN_API_KEY = safe(process.env.MAILGUN_API_KEY || "");
const MAILGUN_DOMAIN = safe(process.env.MAILGUN_DOMAIN || "");
const MAILGUN_API_BASE = safe(
  process.env.MAILGUN_API_BASE || "https://api.mailgun.net/v3",
).replace(/\/+$/g, "");

// Provider: if not explicitly set, prefer Mailgun API when creds exist (Render free blocks SMTP)
const RAW_PROVIDER = safe(process.env.MAIL_PROVIDER || "").toLowerCase();
const MAIL_PROVIDER =
  RAW_PROVIDER || (MAILGUN_API_KEY && MAILGUN_DOMAIN ? "mailgun" : "smtp");

const PORT = Number(process.env.MAIL_PORT) || 587;
const IS_SECURE = PORT === 465;
const escapeHtml = (str) =>
  safe(str).replace(
    /[&<>"'`=\/]/g,
    (s) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
      })[s],
  );

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safe(s));
const resolveRecipient = (to) =>
  !IS_PROD && REDIRECT_ALL_TO ? REDIRECT_ALL_TO : to;

const buildBasicAuth = (user, pass) =>
  Buffer.from(`${user}:${pass}`, "utf8").toString("base64");

const sendViaMailgunApi = async ({
  from,
  to,
  subject,
  html,
  text,
  replyTo,
  headers,
}) => {
  if (!MAILGUN_API_KEY) throw new Error("MAILGUN_API_KEY env is missing");
  if (!MAILGUN_DOMAIN) throw new Error("MAILGUN_DOMAIN env is missing");

  const url = `${MAILGUN_API_BASE}/${MAILGUN_DOMAIN}/messages`;
  const params = new URLSearchParams();
  params.set("from", from);
  params.set("to", to);
  params.set("subject", subject);
  if (text) params.set("text", text);
  if (html) params.set("html", html);
  if (replyTo) params.set("h:Reply-To", replyTo);
  for (const [k, v] of Object.entries(headers || {})) {
    params.set(`h:${k}`, String(v));
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${buildBasicAuth("api", MAILGUN_API_KEY)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const bodyText = await res.text();
  if (!res.ok) {
    throw new Error(`Mailgun API error: ${res.status} ${bodyText}`);
  }
  try {
    return JSON.parse(bodyText);
  } catch (err) {
    return { ok: true, raw: bodyText };
  }
};

const smtpTransporter =
  MAIL_PROVIDER === "smtp"
    ? nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: PORT,
        secure: IS_SECURE,
        requireTLS: !IS_SECURE,
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
      })
    : null;

export const verifySMTP = async () => {
  if (MAIL_PROVIDER === "mailgun") return true;
  if (!smtpTransporter) throw new Error("SMTP transporter is not initialized");
  return smtpTransporter.verify();
};

export const sendEmail = async (
  toRaw,
  subjectRaw,
  htmlRaw,
  { replyTo } = {},
) => {
  const toOriginal = safe(toRaw);
  const to = resolveRecipient(toOriginal);

  const subject = safe(subjectRaw);
  const html = safe(htmlRaw);
  const text = convert(html || "", { wordwrap: 130 });

  const fromName = safe(process.env.MAIL_FROM_NAME || "No-Reply");
  const fromEmail = safe(process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER);
  const defaultReplyTo = safe(process.env.MAIL_REPLY_TO || "");
  const effectiveReplyTo = safe(replyTo) || defaultReplyTo;

  const headers = {
    "X-App": "CowboyLogic",
    "X-Env": process.env.NODE_ENV || "development",
  };

  if (!IS_PROD && REDIRECT_ALL_TO) {
    headers["X-Original-To"] = toOriginal || "(empty)";
  }

  const from = `"${fromName}" <${fromEmail}>`;
  const mailOptions = {
    from,
    to,
    subject,
    html,
    text,
    headers,
    ...(effectiveReplyTo && isEmail(effectiveReplyTo)
      ? { replyTo: effectiveReplyTo }
      : {}),
  };

  console.log(
    "📨 Sending email:",
    {
      to: mailOptions.to,
      subject: mailOptions.subject,
      env: process.env.NODE_ENV || "dev",
    },
    "via",
    MAIL_PROVIDER === "mailgun"
      ? "mailgun api"
      : smtpTransporter?.options?.host,
    "port:",
    MAIL_PROVIDER === "mailgun" ? "-" : smtpTransporter?.options?.port,
  );

  try {
    if (MAIL_PROVIDER === "mailgun") {
      const info = await sendViaMailgunApi({
        from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text,
        replyTo: mailOptions.replyTo,
        headers: mailOptions.headers,
      });
      console.log("✅ Email sent:", info?.message || info?.id || "ok");
      return info;
    }

    if (!smtpTransporter)
      throw new Error("SMTP transporter is not initialized");
    const info = await smtpTransporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response || info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email send error:", err?.message || err);
    throw new Error("Email send failed: " + (err?.message || String(err)));
  }
};

export const sendContactEmail = async ({
  firstName,
  lastName,
  email,
  message,
  comment,
}) => {
  const body = safe(message ?? comment);
  const name = safe(`${safe(firstName)} ${safe(lastName)}`) || "Contact Form";

  const adminRecipient = safe(
    process.env.MAIL_ADMIN || process.env.EMAIL_ADMIN,
  );
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

export const sendOrderConfirmationEmail = async ({ to, order, items }) => {
  const itemList = (items || [])
    .map((item) => {
      const title = escapeHtml(item?.Book?.title ?? item?.title ?? "Item");
      const unit =
        item?.Book?.partnerPrice ?? item?.Book?.price ?? item?.price ?? 0;
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
