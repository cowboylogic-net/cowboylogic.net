// controllers/newsletterController.js
import Subscriber from "../models/Subscriber.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import sendResponse from "../utils/sendResponse.js";
import sanitizeHtml from "sanitize-html";

dotenv.config();

// ✅ Надійніша конфігурація SMTP (порт числом, auto secure for 465, пул)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: String(process.env.MAIL_PORT) === "465", // 465 => TLS
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Опційна легка санітизація HTML для розсилки (адмінський канал)
const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "h3",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
  ]),
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height", "style"],
    td: ["colspan", "rowspan", "style"],
    th: ["colspan", "rowspan", "style"],
    table: ["style"],
  },
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs && attribs.target === "_blank") {
        const relParts = (attribs.rel || "").split(/\s+/).filter(Boolean);
        if (!relParts.includes("noopener")) relParts.push("noopener");
        if (!relParts.includes("noreferrer")) relParts.push("noreferrer");
        attribs.rel = relParts.join(" ");
      }
      return { tagName, attribs };
    },
  },
};

const subscribe = async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  if (!email) throw HttpError(400, "Email is required");

  const exists = await Subscriber.findOne({ where: { email } });
  if (exists) throw HttpError(409, "Email already subscribed");

  await Subscriber.create({ email });

  sendResponse(res, { code: 201, message: "Subscribed successfully" });
};

const sendNewsletter = async (req, res) => {
  const { subject, content } = req.body;

  if (!subject) throw HttpError(400, "Subject is required");

  const subscribers = await Subscriber.findAll({ attributes: ["email"] });
  const emails = [
    ...new Set(
      subscribers.map((s) =>
        String(s.email || "")
          .trim()
          .toLowerCase()
      )
    ),
  ].filter(Boolean);

  if (emails.length === 0) {
    return sendResponse(res, { code: 200, message: "No subscribers to send" });
  }

  const safeHtml = sanitizeHtml(content || "", sanitizeOptions);
  const textAlt = safeHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const chunkSize = 50;
  const fromName = process.env.MAIL_FROM_NAME || "CL";
  const fromAddr = process.env.MAIL_FROM || process.env.MAIL_USER;

  // ⬇️ акумулюємо невдалі адресати, але не валимо запит
  const failed = [];

  for (let i = 0; i < emails.length; i += chunkSize) {
    const chunk = emails.slice(i, i + chunkSize);

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromAddr}>`,
        to: fromAddr, // технічний отримувач
        bcc: chunk, // підписники — у BCC
        subject,
        text: textAlt,
        html: safeHtml,
        // ⬇️ підвищує доставлюваність/UX
        headers: {
          "List-Unsubscribe": `<mailto:${fromAddr}?subject=unsubscribe>`,
        },
      });
    } catch (err) {
      console.error("Newsletter chunk send failed:", err.message);
      // позначаємо всіх із chunk як потенційно невдалих (спрощено)
      failed.push(...chunk);
    }
  }

  sendResponse(res, {
    code: 200,
    message: "Newsletter sent",
    data: { recipients: emails.length, failed },
  });
};

const unsubscribe = async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  if (!email) throw HttpError(400, "Email is required");
  const deleted = await Subscriber.destroy({ where: { email } });
  // не розкриваємо, чи існував email — норм для приватності
  sendResponse(res, { code: 200, message: "Unsubscribed" });
};

export default {
  subscribe: ctrlWrapper(subscribe),
  sendNewsletter: ctrlWrapper(sendNewsletter),
  unsubscribe: ctrlWrapper(unsubscribe),
};
