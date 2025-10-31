import crypto from "crypto";

export default function verifySquareSignature(req, res, next) {
  try {
    const secret = (process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "").trim();
    if (!secret) {
      console.warn(
        "[Square] No SQUARE_WEBHOOK_SIGNATURE_KEY set — skipping signature verification"
      );
      return next();
    }

    const signatureHeader = (
      req.get("x-square-hmacsha256-signature") || ""
    ).trim();

    console.log("[WH] sig hdr=", req.get("x-square-hmacsha256-signature"));
    console.log("[WH] notifUrl=", process.env.SQUARE_WEBHOOK_NOTIFICATION_URL);
    console.log(
      "[WH] rawLen=",
      Buffer.isBuffer(req.body) ? req.body.length : -1
    );

    if (!signatureHeader) {
      return res
        .status(400)
        .json({
          status: "fail",
          code: 400,
          message: "Missing Square signature header",
        });
    }

    // ❶ Square підписує: EXACT_NOTIFICATION_URL + RAW_BODY
    //    Використовуємо URL з .env, щоб не потрапити у пастку http/https та проксі.
    const notifUrl =
      (process.env.SQUARE_WEBHOOK_NOTIFICATION_URL || "").trim() ||
      `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    // ❷ raw тіло (без змін); у server.js для цього стоїть express.raw({ type: "*/*" })
    const rawBodyStr = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : String(req.body || "");

    const base = notifUrl + rawBodyStr;

    const computed = crypto
      .createHmac("sha256", secret)
      .update(base)
      .digest("base64");

    // Допускаємо, що Square може прислати кілька сигнатур через кому — звіряємо будь-яку
    const candidates = signatureHeader
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const match = candidates.some((sig) => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(computed, "utf8"),
          Buffer.from(sig, "utf8")
        );
      } catch {
        return false;
      }
    });

    if (!match) {
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
