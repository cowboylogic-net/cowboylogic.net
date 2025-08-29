// server/middleware/validateQuery.js
const validateQuery = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.query, {
    convert: true,
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({
      status: "fail",
      code: 400,
      message: error.details?.[0]?.message || "Invalid query params",
    });
  }

  // ❗ ВАЖЛИВО: НЕ присвоюємо req.query = value (Express 5 це забороняє)
  // Кладемо у власне поле:
  req.validated = req.validated || {};
  req.validated.query = value;

  next();
};

export default validateQuery;
