// middleware/validateParams.js
import HttpError from "../helpers/HttpError.js";

export const validateParams = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params);
  if (error) {
    const details = (error.details || []).map((item) => ({
      path: item.path,
      type: item.type,
      message: item.message,
    }));
    return next(
      HttpError(400, error.details[0].message, {
        code: "VALIDATION_PARAMS_INVALID",
        details,
      })
    );
  }
  next();
};
