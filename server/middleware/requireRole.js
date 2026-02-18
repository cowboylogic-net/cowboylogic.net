import HttpError from "../helpers/HttpError.js";

export const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        HttpError(
          401,
          "Unauthorized: No user or role found.",
          "AUTH_USER_ROLE_REQUIRED",
        ),
      );
    }

    if (req.user.isSuperAdmin === true || req.user.role === "superAdmin") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        HttpError(403, "Forbidden: Access denied.", "AUTH_FORBIDDEN"),
      );
    }

    next();
  };
