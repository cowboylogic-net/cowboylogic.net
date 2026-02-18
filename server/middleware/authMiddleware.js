import jwt from "jsonwebtoken";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return next(HttpError(401, "Not authorized, no token", "AUTH_NO_TOKEN"));
  }
  const token = match[1];
  if (!token || token === "undefined" || token === "null") {
    return next(HttpError(401, "Not authorized, bad token", "AUTH_BAD_TOKEN"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id ?? decoded.sub;
    if (!userId) {
      return next(
        HttpError(401, "Invalid token payload", "AUTH_INVALID_PAYLOAD")
      );
    }

    const user = await User.findByPk(userId);

    if (!user) return next(HttpError(401, "User not found", "AUTH_USER_NOT_FOUND"));

    const tokenVersion = decoded.tokenVersion ?? decoded.tv ?? 0;
    const currentVersion = user.tokenVersion ?? 0;
    if (tokenVersion !== currentVersion) {
      return next(
        HttpError(401, "Token has been invalidated", "AUTH_TOKEN_REVOKED")
      );
    }

    req.user = user;

    console.log("[auth_access]", {
      requestId: req.requestId,
      userId: user.id,
      role: user.role,
      method: req.method,
      path: req.originalUrl,
    });

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(HttpError(401, "Token expired", "AUTH_TOKEN_EXPIRED"));
    }
    return next(HttpError(401, "Invalid token", "AUTH_INVALID_TOKEN"));
  }
};

export const isAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" ||
      req.user.role === "superAdmin" ||
      req.user?.isSuperAdmin === true)
  ) {
    next();
  } else {
    next(HttpError(403, "Access denied. Admins only.", "AUTH_ADMIN_REQUIRED"));
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user?.isSuperAdmin) {
    return next();
  }
  return next(
    HttpError(403, "Access denied. Super admin only.", "AUTH_SUPER_ADMIN_REQUIRED")
  );
};

export const isAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return next(HttpError(401, "Not authorized", "AUTH_REQUIRED"));
  }
  const isAdmin = req.user.role === "admin";
  const isSA = req.user.role === "superAdmin" || req.user.isSuperAdmin === true;
  if (isAdmin || isSA) return next();
  return next(HttpError(403, "Access denied. Admins only.", "AUTH_ADMIN_REQUIRED"));
};
