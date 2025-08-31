// server/middleware/errorMiddleware.js
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Server error";

  console.error("🔥 Error:", message);

  res.status(status).json({ message });
};
