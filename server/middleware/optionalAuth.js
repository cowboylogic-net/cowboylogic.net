// middleware/optionalAuth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "role", "tokenVersion"],
      });
      if (user) {
        if (
          user.tokenVersion == null ||
          decoded.tokenVersion === user.tokenVersion
        ) {
          req.user = user; // { id, role, tokenVersion? }
        }
      }
    } catch (_) {
      // ігноруємо помилки – запит іде як публічний
    }
  }
  next();
};
