// middleware/validateBody.js
import HttpError from "../helpers/HttpError.js";

export const validateBody = (schema, isMultipart = false) => {
  return (req, res, next) => {
    const data = { ...req.body };

    // Якщо multipart, то кастимо типи вручну
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
    if (!error) req.body = value;
    if (error) {
      return next(HttpError(400, `Validation error: ${error.message}`));
    }

    // Зберігаємо перевірені значення назад
    req.body = data;
    next();
  };
};
