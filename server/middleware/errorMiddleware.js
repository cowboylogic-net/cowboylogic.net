// server/middleware/errorMiddleware.js
const STATUS_CODE_MAP = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  415: "UNSUPPORTED_MEDIA_TYPE",
  422: "UNPROCESSABLE_ENTITY",
  429: "RATE_LIMITED",
  500: "INTERNAL_ERROR",
  502: "BAD_GATEWAY",
  503: "SERVICE_UNAVAILABLE",
  504: "GATEWAY_TIMEOUT",
};

const sanitizeDetails = (details) => {
  if (!details) return undefined;

  if (Array.isArray(details)) {
    const cleaned = details
      .map((item) => {
        if (typeof item === "string") return { message: item };
        if (!item || typeof item !== "object") return null;

        const safe = {};
        if (Array.isArray(item.path)) safe.path = item.path;
        if (typeof item.type === "string") safe.type = item.type;
        if (typeof item.code === "string") safe.code = item.code;
        if (typeof item.message === "string") safe.message = item.message;
        return Object.keys(safe).length ? safe : null;
      })
      .filter(Boolean);

    return cleaned.length ? cleaned : undefined;
  }

  if (typeof details === "string") {
    return [{ message: details }];
  }

  if (typeof details === "object") {
    const safe = {};
    if (Array.isArray(details.path)) safe.path = details.path;
    if (typeof details.type === "string") safe.type = details.type;
    if (typeof details.code === "string") safe.code = details.code;
    if (typeof details.message === "string") safe.message = details.message;
    return Object.keys(safe).length ? [safe] : undefined;
  }

  return undefined;
};

export const errorHandler = (err, req, res, _next) => {
  const status = Number.isInteger(err?.status) ? err.status : 500;
  const requestId = req?.requestId || "unknown";
  const code =
    typeof err?.code === "string" && err.code.trim()
      ? err.code.trim().toUpperCase()
      : STATUS_CODE_MAP[status] || "INTERNAL_ERROR";
  const message =
    typeof err?.message === "string" && err.message.trim()
      ? err.message
      : status >= 500
        ? "Internal server error"
        : "Request failed";
  const details = sanitizeDetails(err?.details);

  const logPayload = {
    requestId,
    method: req?.method,
    path: req?.originalUrl,
    status,
    code,
  };

  if (status >= 500) {
    console.error("[api_error]", logPayload, err);
  } else if (process.env.NODE_ENV !== "production") {
    console.warn("[api_error]", logPayload);
  }

  const payload = { code, message, requestId };
  if (details) payload.details = details;

  res.status(status).json(payload);
};
