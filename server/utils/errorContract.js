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

const pickStatus = (input, fallbackStatus = 500) => {
  const candidate = input?.status ?? input?.statusCode;
  if (Number.isInteger(candidate) && candidate >= 400 && candidate <= 599) {
    return candidate;
  }
  if (
    Number.isInteger(fallbackStatus) &&
    fallbackStatus >= 400 &&
    fallbackStatus <= 599
  ) {
    return fallbackStatus;
  }
  return 500;
};

const pickCode = (input, status) => {
  if (typeof input?.code === "string" && input.code.trim()) {
    return input.code.trim().toUpperCase();
  }
  return STATUS_CODE_MAP[status] || "INTERNAL_ERROR";
};

const pickMessage = (input, status) => {
  if (status >= 500) {
    return "Internal server error";
  }

  if (typeof input === "string" && input.trim()) {
    return input.trim();
  }

  if (typeof input?.message === "string" && input.message.trim()) {
    return input.message;
  }

  return "Request failed";
};

export const normalizeApiError = (
  input,
  { fallbackStatus = 500, requestId = "unknown" } = {}
) => {
  const status = pickStatus(input, fallbackStatus);
  const code = pickCode(input, status);
  const message = pickMessage(input, status);
  const details = sanitizeDetails(input?.details);

  const payload = { code, message, requestId };
  if (details) payload.details = details;

  return { status, payload };
};
