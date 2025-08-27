// middleware/requireRole.js
export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: "Unauthorized: No user or role found." });
  }

  // ✅ супер-адмін завжди проходить
  if (req.user.isSuperAdmin === true) {
    return next();
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Access denied." });
  }

  next();
};
