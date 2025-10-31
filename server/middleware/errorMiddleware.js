// server/middleware/errorMiddleware.js
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Server error";
  const base = `${req.method} ${req.originalUrl}`;

  if (status >= 500) {
    console.error("🔥", status, base, "-", message);
  } else {
    console.warn("⚠️", status, base, "-", message);
  }
  res.status(status).json({ message });
};
