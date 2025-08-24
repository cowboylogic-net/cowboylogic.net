// middleware/verifySquareSignature.js
import crypto from "crypto";

export default function verifySquareSignature(req, res, next) {
  try {
    const secret = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (!secret) {
      console.warn(
        "[Square] No SQUARE_WEBHOOK_SIGNATURE_KEY set — skipping signature verification"
      );
      return next();
    }

    const signatureHeader = req.get("x-square-hmacsha256-signature");
    if (!signatureHeader) {
      return res
        .status(400)
        .json({
          status: "fail",
          code: 400,
          message: "Missing Square signature header",
        });
    }

    // IMPORTANT: req.body тут — Buffer (бо ми використовуємо express.raw)
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(req.body || "", "utf8");
    const computed = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64");

    const valid = (() => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(computed, "utf8"),
          Buffer.from(signatureHeader, "utf8")
        );
      } catch {
        return false;
      }
    })();
    if (!valid) {
      return res
        .status(400)
        .json({
          status: "fail",
          code: 400,
          message: "Invalid Square signature",
        });
    }

    return next();
  } catch (e) {
    console.error("Signature verification error:", e?.message || e);
    return res
      .status(400)
      .json({
        status: "fail",
        code: 400,
        message: "Square signature verify error",
      });
  }
}
