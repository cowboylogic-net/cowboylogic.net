// middleware/verifySquareSignature.js
import crypto from "crypto";

export default function verifySquareSignature(req, res, next) {
  try {
    const secret = (process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "").trim();
    if (!secret) {
      console.warn("[Square] No SQUARE_WEBHOOK_SIGNATURE_KEY set — skipping signature verification");
      return next();
    }

    // приймаємо новий і старий заголовки
    const signatureHeader = (req.get("x-square-hmacsha256-signature") || req.get("x-square-signature") || "").trim();

    // діагностика
    console.log("[WH] sig hdr=", signatureHeader);
    console.log("[WH] notifUrl=", process.env.SQUARE_WEBHOOK_NOTIFICATION_URL);
    console.log("[WH] rawLen=", Buffer.isBuffer(req.body) ? req.body.length : -1);

    if (!signatureHeader) {
      return res.status(400).json({ status: "fail", code: 400, message: "Missing Square signature header" });
    }

    // 1) Точний URL (ідеально — з .env, щоб схему/хост не зламав проксі)
    const notifUrl =
      (process.env.SQUARE_WEBHOOK_NOTIFICATION_URL || "").trim() ||
      `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    // 2) Сире тіло **байтами**
    const bodyBuf = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body || ""), "utf8");

    // 3) Конкатенація байтів URL + BODY без проміжних рядкових перетворень
    const urlBuf = Buffer.from(notifUrl, "utf8");
    const payload = Buffer.concat([urlBuf, bodyBuf]);

    const computedB64 = crypto.createHmac("sha256", secret).update(payload).digest("base64");

    // Square може відправити кілька сигнатур через кому або пробіл
    const candidates = signatureHeader
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const match = candidates.some(sig => {
      try {
        const a = Buffer.from(computedB64, "utf8");
        const b = Buffer.from(sig, "utf8");
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
      } catch {
        return false;
      }
    });

    if (!match) {
      return res.status(400).json({ status: "fail", code: 400, message: "Invalid Square signature" });
    }

    return next();
  } catch (e) {
    console.error("Signature verification error:", e?.message || e);
    return res.status(400).json({ status: "fail", code: 400, message: "Square signature verify error" });
  }
}
