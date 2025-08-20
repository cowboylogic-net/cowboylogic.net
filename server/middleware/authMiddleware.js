import jwt from "jsonwebtoken";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    // ✅ Перевіряємо відповідність tokenVersion
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: "Token has been invalidated" });
    }

    req.user = user;

    console.log(
      `[AUTH] User ${user.email} with role ${user.role} accessed ${req.method} ${req.originalUrl}`
    );

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "superAdmin" || req.user?.isSuperAdmin === true)) {
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

