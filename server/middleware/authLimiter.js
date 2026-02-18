import rateLimit from "express-rate-limit";
import HttpError from "../helpers/HttpError.js";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 10, // максимум 10 спроб з однієї IP
  handler: (_req, _res, next) =>
    next(
      HttpError(
        429,
        "Too many login attempts from this IP, please try again later.",
        "AUTH_RATE_LIMITED"
      )
    ),
});
