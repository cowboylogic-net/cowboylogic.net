// controllers/newsletterController.js
import Subscriber from "../models/Subscriber.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) throw HttpError(400, "Email is required");
  const exists = await Subscriber.findOne({ where: { email } });
  if (exists) throw HttpError(409, "Email already subscribed");
  await Subscriber.create({ email });
  res.status(201).json({ message: "Subscribed successfully" });
};

const sendNewsletter = async (req, res) => {
  const { subject, content } = req.body;
  if (!subject || !content) throw HttpError(400, "Subject and content required");
  const subscribers = await Subscriber.findAll();
  const emails = subscribers.map((s) => s.email);

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: emails,
    subject,
    html: content,
  });

  res.json({ message: "Newsletter sent" });
};

export default {
  subscribe: ctrlWrapper(subscribe),
  sendNewsletter: ctrlWrapper(sendNewsletter),
};