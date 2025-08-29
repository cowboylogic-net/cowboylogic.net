// server/utils/cookies.js
// Універсальна стратегія: якщо фронт і бек на одному сайті (localhost або один домен) — SameSite=Lax.
// Якщо крос-домен (стейдж/прод) — SameSite=None + Secure. Domain беремо з .env (якщо заданий).

function computeCookieOpts(req) {
  const isProd = process.env.NODE_ENV === "production";
  const explicitSameSite = process.env.COOKIE_SAMESITE; // "Lax" | "None" | "Strict" (опційно)
  const explicitDomain = process.env.COOKIE_DOMAIN || undefined; // напр. ".cowboylogic.net"

  // Протокол (враховує reverse proxy)
  const xfProto = req.get?.("x-forwarded-proto");
  const scheme = xfProto
    ? xfProto.split(",")[0].trim()
    : req.protocol || "http";

  // Хости
  const origin = req.get?.("origin");
  let originHost;
  try {
    originHost = origin ? new URL(origin).hostname : undefined;
  } catch {
    /* noop */
  }
  const serverHost = (req.get?.("host") || "").split(":")[0];

  // Якщо той самий хост (localhost↔localhost, app.example.com↔api.example.com теж вважай "сейм-сайт"),
  // тримаємось Lax. Інакше — None.
  const sameSiteAuto =
    originHost && serverHost && originHost === serverHost ? "Lax" : "None";
  const sameSite = explicitSameSite || sameSiteAuto;

  // Secure: для None завжди true; інакше — по протоколу
  const secureAuto = sameSite === "None" ? true : scheme === "https";
  let secure = secureAuto;
  if (process.env.COOKIE_SECURE?.toLowerCase() === "true") secure = true;
  if (process.env.COOKIE_SECURE?.toLowerCase() === "false") secure = false;

  // Domain: використовуємо лише якщо явно заданий. На локалці краще не задавати.
  const domain = explicitDomain || undefined;

  return { sameSite, secure, domain, path: "/api/auth" };
}

export function setRefreshCookie(res, token, req) {
  const { sameSite, secure, domain, path } = computeCookieOpts(req);
  res.cookie("rt", token, {
    httpOnly: true,
    sameSite,
    secure,
    path,
    ...(domain ? { domain } : {}),
    maxAge: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "7", 10) * 86400000,
  });
}

export function clearRefreshCookie(res, req) {
  const { sameSite, secure, domain, path } = computeCookieOpts(req);
  res.clearCookie("rt", {
    httpOnly: true,
    sameSite,
    secure,
    path,
    ...(domain ? { domain } : {}),
  });
}
