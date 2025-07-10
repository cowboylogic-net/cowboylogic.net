// middleware/validateParams.js
import HttpError from "../helpers/HttpError.js";

export const validateParams = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params);
  if (error) {
    return next(HttpError(400, error.details[0].message));
  }
  next();
};
