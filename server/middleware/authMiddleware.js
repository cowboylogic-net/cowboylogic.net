import jwt from "jsonwebtoken";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  const token = match[1];
  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ message: "Not authorized, bad token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id ?? decoded.sub;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findByPk(userId);

    if (!user) return res.status(401).json({ message: "User not found" });

    const tokenVersion = decoded.tokenVersion ?? decoded.tv ?? 0;
    const currentVersion = user.tokenVersion ?? 0;
    if (tokenVersion !== currentVersion) {
      return res.status(401).json({ message: "Token has been invalidated" });
    }

    req.user = user;

    console.log(
      `[AUTH] User ${user.email} with role ${user.role} accessed ${req.method} ${req.originalUrl}`
    );

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid token" });
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
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user?.isSuperAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Super admin only." });
};

export const isAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  const isAdmin = req.user.role === "admin";
  const isSA = req.user.role === "superAdmin" || req.user.isSuperAdmin === true;
  if (isAdmin || isSA) return next();
  return res.status(403).json({ message: "Access denied. Admins only." });
};
