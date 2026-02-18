// server/middleware/errorMiddleware.js
import { normalizeApiError } from "../utils/errorContract.js";
import { logError, logWarn } from "../utils/logger.js";

export const errorHandler = (err, req, res, _next) => {
  const requestId = req?.requestId || "unknown";
  const { status, payload } = normalizeApiError(err, { requestId });

  const logPayload = {
    requestId,
    method: req?.method,
    path: req?.originalUrl,
    status,
    code: payload.code,
  };

  if (status >= 500) {
    logError("[api_error]", logPayload, err);
  } else if (process.env.NODE_ENV !== "production") {
    logWarn("[api_error]", logPayload);
  }

  res.status(status).json(payload);
};
