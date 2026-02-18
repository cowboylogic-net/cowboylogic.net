// server/helpers/HttpError.js
export default function HttpError(status = 500, message = "Server error", meta = {}) {
  const error = new Error(message);
  error.status = status;

  if (typeof meta === "string" && meta.trim()) {
    error.code = meta.trim().toUpperCase();
    return error;
  }

  if (meta && typeof meta === "object") {
    if (typeof meta.code === "string" && meta.code.trim()) {
      error.code = meta.code.trim().toUpperCase();
    }
    if (meta.details !== undefined) {
      error.details = meta.details;
    }
  }

  return error;
}
