const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE = "Network error. Please check your connection and try again.";

const readRequestId = (headers = {}) =>
  headers["x-request-id"] || headers["X-Request-Id"] || null;

const toSafeString = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const fallbackCodeByStatus = (status) => {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 422 || status === 400) return "VALIDATION_ERROR";
  if (status >= 500) return "INTERNAL_ERROR";
  return "API_ERROR";
};

const fallbackMessageByStatus = (status) => {
  if (status === 401) return "Authentication required.";
  if (status === 403) return "You do not have access to perform this action.";
  if (status === 404) return "Requested resource was not found.";
  if (status === 422 || status === 400) return "Please check your input and try again.";
  if (status >= 500) return GENERIC_ERROR_MESSAGE;
  return GENERIC_ERROR_MESSAGE;
};

const normalizeFieldErrors = (details) => {
  if (!details) return null;

  if (Array.isArray(details?.errors)) {
    const mapped = {};
    details.errors.forEach((item) => {
      const field = item?.field || item?.path || item?.name;
      const message = toSafeString(item?.message);
      if (field && message) mapped[field] = message;
    });
    return Object.keys(mapped).length ? mapped : null;
  }

  if (details?.fieldErrors && typeof details.fieldErrors === "object") {
    const mapped = {};
    Object.entries(details.fieldErrors).forEach(([field, value]) => {
      const message = Array.isArray(value) ? toSafeString(value[0]) : toSafeString(value);
      if (message) mapped[field] = message;
    });
    return Object.keys(mapped).length ? mapped : null;
  }

  if (Array.isArray(details)) {
    const mapped = {};
    details.forEach((item) => {
      const field = item?.field || item?.path || item?.name;
      const message = toSafeString(item?.message);
      if (field && message) mapped[field] = message;
    });
    return Object.keys(mapped).length ? mapped : null;
  }

  return null;
};

export const normalizeApiError = (error) => {
  if (error?.response) {
    const status = error.response.status;
    const payload = error.response.data || {};
    const message =
      toSafeString(payload?.message) ||
      toSafeString(error?.message) ||
      fallbackMessageByStatus(status);
    return {
      code: toSafeString(payload?.code) || fallbackCodeByStatus(status),
      message: status >= 500 ? GENERIC_ERROR_MESSAGE : message,
      details: payload?.details,
      requestId: payload?.requestId || readRequestId(error.response.headers),
      status,
    };
  }

  if (error?.request) {
    return {
      code: "NETWORK_ERROR",
      message: NETWORK_ERROR_MESSAGE,
      status: null,
      requestId: null,
      details: null,
    };
  }

  const message = toSafeString(error?.message) || GENERIC_ERROR_MESSAGE;
  return {
    code: toSafeString(error?.code) || "UNEXPECTED_ERROR",
    message,
    details: error?.details || null,
    requestId: error?.requestId || null,
    status: typeof error?.status === "number" ? error.status : null,
  };
};

export const mapApiErrorToUi = (apiError) => {
  const normalized = apiError || normalizeApiError();
  const fieldErrors = normalizeFieldErrors(normalized.details);
  const hasHttpStatus =
    typeof normalized.status === "number" &&
    normalized.status >= 400 &&
    normalized.status <= 599;

  if (fieldErrors) {
    return {
      title: "Please check your input",
      message: normalized.message || "Please fix the highlighted fields.",
      severity: "warning",
      fieldErrors,
      requestId: normalized.requestId || null,
    };
  }

  if (normalized.code === "NETWORK_ERROR") {
    return {
      title: "Network error",
      message: NETWORK_ERROR_MESSAGE,
      severity: "error",
      fieldErrors: null,
      requestId: null,
    };
  }

  if (normalized.status === 401) {
    return {
      title: "Authentication required",
      message: "Please sign in and try again.",
      severity: "warning",
      fieldErrors: null,
      requestId: normalized.requestId || null,
    };
  }

  if (normalized.status === 403) {
    return {
      title: "Access denied",
      message: "You do not have permission to perform this action.",
      severity: "warning",
      fieldErrors: null,
      requestId: normalized.requestId || null,
    };
  }

  if (!hasHttpStatus || normalized.code === "UNEXPECTED_ERROR") {
    return {
      title: "Unexpected error",
      message: GENERIC_ERROR_MESSAGE,
      severity: "error",
      fieldErrors: null,
      requestId: normalized.requestId || null,
    };
  }

  return {
    title: "Unexpected error",
    message:
      normalized.status >= 500
        ? GENERIC_ERROR_MESSAGE
        : normalized.message || GENERIC_ERROR_MESSAGE,
    severity: "error",
    fieldErrors: null,
    requestId: normalized.requestId || null,
  };
};

export const formatUiErrorMessage = (uiError) => {
  const message = toSafeString(uiError?.message) || GENERIC_ERROR_MESSAGE;
  if (!uiError?.requestId) return message;
  return `${message} (Request ID: ${uiError.requestId})`;
};
