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
import "./models/index.js";

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
import searchRoutes from "./routes/searchRoutes.js";
import userSelfRoutes from "./routes/userSelfRoutes.js";
import staticCors from "./middleware/staticCors.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
import { requireEnv } from "./config/requireEnv.js";
requireEnv();
const app = express();
const PORT = process.env.PORT || 5000;

// ❌ вимикаємо ETag, щоб не було 304 без тіла
app.set("etag", false);

// ❗ гарантуємо, що тіло завжди свіже
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Middleware
app.use(cors({ origin: true, credentials: true }));

app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
app.use("/api/webhook", webhookRoutes);
app.use(express.json());

app.use("/api", (req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/square", squareRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/images", imageRoutes);
app.use("/api", searchRoutes);
app.use("/api/me", userSelfRoutes);
app.use("/uploads", staticCors, express.static("public/uploads"));
app.use("/documents", staticCors, express.static("public/documents"));

// Global error handler
app.use(errorHandler);

// DB init
connectDB().then(async () => {
  await sequelize.sync();
  // await sequelize.sync({ alter: true });
  if (process.env.NODE_ENV !== "production") {
    try {
      await seedSuperAdmin();
    } catch (error) {
      console.warn("⚠️ Super admin seed skipped:", error.message);
    }
  }
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
