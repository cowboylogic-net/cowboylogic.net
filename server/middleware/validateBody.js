import HttpError from "../helpers/HttpError.js";

export const validateBody = (schema, isMultipart = false) => {
  return (req, res, next) => {
    const data = { ...req.body };
    if (isMultipart) {
      for (const key in data) {
        if (data[key] === "true") data[key] = true;
        else if (data[key] === "false") data[key] = false;
        else if (!isNaN(data[key]) && data[key].trim() !== "") {
          data[key] = Number(data[key]);
        }
      }
    }

    const { error, value } = schema.validate(data, { stripUnknown: true });
    if (error) {
      const details = (error.details || []).map((item) => ({
        path: item.path,
        type: item.type,
        message: item.message,
      }));
      return next(
        HttpError(400, `Validation error: ${error.message}`, {
          code: "VALIDATION_BODY_INVALID",
          details,
        }),
      );
    }

    req.body = value;
    next();
  };
};
