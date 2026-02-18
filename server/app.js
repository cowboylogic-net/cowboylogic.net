// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";

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
import squareRoutes from "./routes/squareRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import userSelfRoutes from "./routes/userSelfRoutes.js";
import staticCors from "./middleware/staticCors.js";
import requestId from "./middleware/requestId.js";
import normalizeErrorResponse from "./middleware/normalizeErrorResponse.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import HttpError from "./helpers/HttpError.js";
import { client } from "./services/squareService.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.set("etag", false);
app.use(requestId);
app.use(normalizeErrorResponse);

const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve("public/uploads");
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});
app.get("/api/square/_ping", (req, res) => {
  res.set("Cache-Control", "no-store");
  return res.status(204).end();
});

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(null, false),
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "X-Requested-With",
      "ngrok-skip-browser-warning",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  }),
);

app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  }),
);

app.post(
  "/api/square/webhook",
  express.raw({ type: "*/*" }),
  verifySquareSignature,
  squareWebhookHandler,
);
app.use(express.json());

if (process.env.ENABLE_SQUARE_DIAG === "1") {
  app.get("/_diag/square/locations", async (req, res) => {
    try {
      const env = (
        process.env.SQUARE_ENV ||
        process.env.NODE_ENV ||
        ""
      ).toLowerCase();
      const token = (process.env.SQUARE_ACCESS_TOKEN || "").trim();
      if (client?.locations?.listLocations) {
        const r = await client.locations.listLocations();
        return res.json({
          ok: true,
          source: "client.locations.listLocations",
          locations: r?.locations ?? [],
        });
      }
      if (client?.locations?.list) {
        const r = await client.locations.list();
        return res.json({
          ok: true,
          source: "client.locations.list",
          locations: r?.locations ?? [],
        });
      }
      if (client?.locationsApi?.listLocations) {
        const r = await client.locationsApi.listLocations();
        return res.json({
          ok: true,
          source: "client.locationsApi.listLocations",
          locations: r?.result?.locations ?? r?.locations ?? [],
        });
      }
      if (client?.locationsApi?.list) {
        const r = await client.locationsApi.list();
        return res.json({
          ok: true,
          source: "client.locationsApi.list",
          locations: r?.result?.locations ?? r?.locations ?? [],
        });
      }

      const base =
        env === "production"
          ? "https://connect.squareup.com"
          : "https://connect.squareupsandbox.com";
      const resp = await fetch(`${base}/v2/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Square-Version": "2025-09-24",
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw data;
      return res.json({
        ok: true,
        source: "fetch /v2/locations",
        locations: data?.locations ?? [],
      });
    } catch (e) {
      console.error("Diag locations error:", e?.body || e);
      res.status(500).json(e?.body || { error: String(e) });
    }
  });
}

app.use("/api", (req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

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
app.use("/api/images", imageRoutes);
app.use("/api", searchRoutes);
app.use("/api/me", userSelfRoutes);

app.use("/uploads", (req, res, next) => {
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  next();
});
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/documents", staticCors, express.static("public/documents"));

app.get("/__static_check", (req, res) => {
  res.json({ ok: true, uploadsDir: UPLOADS_DIR });
});

app.use((req, res, next) => next(HttpError(404, "Route not found")));
app.use(errorHandler);

export default app;
