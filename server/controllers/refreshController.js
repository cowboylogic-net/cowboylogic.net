import jwt from "jsonwebtoken";
import { setRefreshCookie } from "../utils/cookies.js";
import User from "../models/User.js";
import sendResponse from "../utils/sendResponse.js";
import HttpError from "../helpers/HttpError.js";

const ACCESS_MIN = parseInt(process.env.ACCESS_TOKEN_TTL_MIN || "15", 10);
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "7", 10);

export async function refreshSession(req, res, next) {
  try {
    const rt = req.cookies?.rt;
    if (!rt)
      return next(HttpError(401, "No refresh token", "AUTH_REFRESH_MISSING"));

    const payload = jwt.verify(rt, process.env.JWT_SECRET);
    if (payload?.type !== "refresh") throw new Error("Invalid token type");
    const user = await User.findByPk(payload.sub);
    if (!user)
      return next(HttpError(401, "User not found", "AUTH_USER_NOT_FOUND"));

    if ((user.tokenVersion || 0) !== (payload.tv || 0))
      return next(HttpError(401, "Token revoked", "AUTH_TOKEN_REVOKED"));

    const access = jwt.sign(
      {
        id: user.id,
        sub: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
        tv: user.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: `${ACCESS_MIN}m` },
    );
    const newRt = jwt.sign(
      { sub: user.id, tv: user.tokenVersion || 0, type: "refresh" },
      process.env.JWT_SECRET,
      { expiresIn: `${REFRESH_DAYS}d` },
    );
    setRefreshCookie(res, newRt, req);
    return sendResponse(res, { code: 200, data: { token: access } });
  } catch (error) {
    if (error?.status) return next(error);
    return next(HttpError(401, "Refresh failed", "AUTH_REFRESH_FAILED"));
  }
}
