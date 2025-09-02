// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import verifySquareSignature from "./middleware/verifySquareSignature.js";
import { squareWebhookHandler } from "./controllers/webhookController.js";

// DB models (щоб ініціалізувати асоціації)
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

const app = express();
app.set("trust proxy", 1);
app.set("etag", false);

// Заборона кешу
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(null, false)),
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "X-Requested-With",
      "ngrok-skip-browser-warning",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  })
);

app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  })
);

// Square webhook — RAW тіло ДО express.json()
app.post(
  "/api/square/webhook",
  express.raw({ type: "*/*" }),
  verifySquareSignature,
  squareWebhookHandler
);

// JSON після raw-маршруту
app.use(express.json());
app.use("/api/webhook", webhookRoutes);

// Додаткова антикеш-політика для /api
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// API routes
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

// Static
app.use("/uploads", express.static("public/uploads"));
app.use("/documents", staticCors, express.static("public/documents"));

// Errors
app.use(errorHandler);

export default app;
