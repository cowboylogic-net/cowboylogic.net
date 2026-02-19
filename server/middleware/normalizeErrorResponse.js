import { normalizeApiError } from "../utils/errorContract.js";

const isStream = (value) =>
  value &&
  typeof value === "object" &&
  typeof value.pipe === "function";

const normalizeErrorResponse = (req, res, next) => {
  const path = req?.originalUrl || req?.url || "";
  if (path && !/^\/api(?:\/|\?|$)/.test(path)) {
    return next();
  }

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  const normalizePayload = (body) =>
    normalizeApiError(body, {
      fallbackStatus: res.statusCode,
      requestId: req?.requestId || "unknown",
    });

  const sendWithOriginalJson = (payload) => {
    const currentSend = res.send;
    res.send = originalSend;
    try {
      return originalJson(payload);
    } finally {
      res.send = currentSend;
    }
  };

  res.json = (body) => {
    if (res.statusCode < 400) {
      return originalJson(body);
    }

    const { status, payload } = normalizePayload(body);

    if (status !== res.statusCode) {
      res.status(status);
    }

    return sendWithOriginalJson(payload);
  };

  res.send = (body) => {
    if (res.statusCode < 400) {
      return originalSend(body);
    }

    if (Buffer.isBuffer(body) || isStream(body)) {
      return originalSend(body);
    }

    if (typeof body === "string" || (body && typeof body === "object")) {
      const source = typeof body === "string" ? { message: body } : body;
      const { status, payload } = normalizePayload(source);

      if (status !== res.statusCode) {
        res.status(status);
      }

      return sendWithOriginalJson(payload);
    }

    return originalSend(body);
  };

  next();
};

export default normalizeErrorResponse;
