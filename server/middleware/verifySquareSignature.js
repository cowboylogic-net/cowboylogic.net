// middleware/verifySquareSignature.js
import crypto from "crypto";
import HttpError from "../helpers/HttpError.js";

export default function verifySquareSignature(req, res, next) {
  try {
    const secret = (process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "").trim();
    if (!secret) {
      console.warn("[Square] No SQUARE_WEBHOOK_SIGNATURE_KEY set - skipping signature verification");
      return next();
    }

    const signatureHeader = (
      req.get("x-square-hmacsha256-signature") ||
      req.get("x-square-signature") ||
      ""
    ).trim();

    if (!signatureHeader) {
      return next(
        HttpError(400, "Missing Square signature header", {
          code: "SQUARE_SIGNATURE_MISSING",
        })
      );
    }

    const notifUrl =
      (process.env.SQUARE_WEBHOOK_NOTIFICATION_URL || "").trim() ||
      `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    const bodyBuf = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(String(req.body || ""), "utf8");

    const payload = Buffer.concat([Buffer.from(notifUrl, "utf8"), bodyBuf]);
    const computedB64 = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64");

    const candidates = signatureHeader
      .split(/[\,\s]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    const match = candidates.some((sig) => {
      try {
        const actual = Buffer.from(computedB64, "utf8");
        const expected = Buffer.from(sig, "utf8");
        if (actual.length !== expected.length) return false;
        return crypto.timingSafeEqual(actual, expected);
      } catch {
        return false;
      }
    });

    if (!match) {
      return next(
        HttpError(400, "Invalid Square signature", {
          code: "SQUARE_SIGNATURE_INVALID",
        })
      );
    }

    return next();
  } catch (error) {
    console.error("Signature verification error:", error?.message || error);
    return next(
      HttpError(400, "Square signature verify error", {
        code: "SQUARE_SIGNATURE_VERIFY_ERROR",
      })
    );
  }
}