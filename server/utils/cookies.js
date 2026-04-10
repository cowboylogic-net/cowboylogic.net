// server/utils/cookies.js

const REFRESH_COOKIE_NAME = "rt";
const REFRESH_COOKIE_PATH = "/api/auth";
const REFRESH_TTL_MS =
  parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "7", 10) * 86400000;

function computeCookieOpts() {
  const isProd = process.env.NODE_ENV === "production";

  // Production policy must be explicit and stable.
  // www.cowboylogic.net -> api.cowboylogic.net is same-site, so Lax is valid.
  // Domain should be fixed via env if you want one shared cookie scope.
  if (isProd) {
    return {
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
      path: REFRESH_COOKIE_PATH,
      ...(process.env.COOKIE_DOMAIN
        ? { domain: process.env.COOKIE_DOMAIN }
        : {}),
    };
  }

  // Local/dev policy
  return {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
    path: REFRESH_COOKIE_PATH,
  };
}

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...computeCookieOpts(),
    maxAge: REFRESH_TTL_MS,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...computeCookieOpts(),
  });

  // Legacy cleanup: clear host-only variant explicitly as well.
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: REFRESH_COOKIE_PATH,
  });

  // Legacy cleanup: if domain cookie is used now, also clear common parent-domain variant.
  if (process.env.COOKIE_DOMAIN) {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      path: REFRESH_COOKIE_PATH,
      domain: process.env.COOKIE_DOMAIN,
    });
  }
}
