import dotenv from "dotenv";
dotenv.config(); // 👈 Додай це сюди

import nodemailer from "nodemailer";

console.log("ENV values:", {
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
});


const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // 👈 дозволяє самопідписані сертифікати (на HostGator часто так)
  },
});


export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
    to,
     text: "Your verification code is 123456",
    subject,
    html,
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
  await sendEmail(process.env.ADMIN_EMAIL, "New Contact Form Submission", html);
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
