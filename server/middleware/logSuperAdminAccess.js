import { logSuperAdminAction } from "../utils/logger.js";

const logSuperAdminAccess = (req, res, next) => {
  if (req.user?.isSuperAdmin) {
    logSuperAdminAction(req.user.email, `Accessed route ${req.method} ${req.originalUrl}`);
  }
  next();
};

export default logSuperAdminAccess;
