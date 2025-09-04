// server/config/publicBase.js
export function getPublicBase(req) {
  const env = process.env.BASE_URL?.replace(/\/+$/, "");
  if (env) return env;                       // головне джерело правди

  // на випадок, якщо BASE_URL не підхопився (fallback)
  const proto = (req.get("x-forwarded-proto") || req.protocol || "http")
    .split(",")[0].trim();
  const host = (req.get("host") || "").trim();
  return host ? `${proto}://${host}` : "";
}
