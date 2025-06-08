// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { sequelize } from "./config/db.js";
import { seedSuperAdmin } from "./seeds/seedSuperAdmin.js";
import connectDB from "./config/db.js";

// Models
import "./models/User.js";
import "./models/Book.js";
import "./models/CartItem.js";
import "./models/Order.js";
import "./models/OrderItem.js";
import "./models/LoginCode.js";
import "./models/Favorite.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import pagesRoutes from "./routes/pagesRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import squareRoutes from "./routes/squareRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());

// 🖼 Доступ до завантажених зображень
// app.use("/uploads", express.static("public/uploads"));
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // ✅ дозвіл на всі origin
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // ✅ це критично для зображень
    next();
  },
  express.static("public/uploads")
);



// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/square", squareRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/images", imageRoutes);

// Global error handler
app.use(errorHandler);

// DB init
connectDB().then(async () => {
  await sequelize.sync();
  if (process.env.NODE_ENV !== "production") {
    try {
      await seedSuperAdmin();
    } catch (error) {
      console.warn("⚠️ Super admin seed skipped:", error.message);
    }
  }
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
