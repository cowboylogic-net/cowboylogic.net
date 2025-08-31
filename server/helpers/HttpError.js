// server/helpers/HttpError.js
export default function HttpError(status = 500, message = "Server error") {
    const error = new Error(message);
    error.status = status;
    return error;
  }
  