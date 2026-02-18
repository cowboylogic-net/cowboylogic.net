// server/middleware/validateQuery.js
import HttpError from "../helpers/HttpError.js";

const validateQuery = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.query, {
    convert: true,
    stripUnknown: true,
  });
  if (error) {
    const details = (error.details || []).map((item) => ({
      path: item.path,
      type: item.type,
      message: item.message,
    }));
    return next(
      HttpError(
        400,
        error.details?.[0]?.message || "Invalid query params",
        { code: "VALIDATION_QUERY_INVALID", details }
      )
    );
  }

  // ❗ ВАЖЛИВО: НЕ присвоюємо req.query = value (Express 5 це забороняє)
  // Кладемо у власне поле:
  req.validated = req.validated || {};
  req.validated.query = value;

  next();
};

export default validateQuery;
