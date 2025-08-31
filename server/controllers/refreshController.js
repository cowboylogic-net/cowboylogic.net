import jwt from "jsonwebtoken";
import { setRefreshCookie } from "../utils/cookies.js";
import User from "../models/User.js";
import sendResponse from "../utils/sendResponse.js";

const ACCESS_MIN = parseInt(process.env.ACCESS_TOKEN_TTL_MIN || "15", 10);
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "7", 10);

export async function refreshSession(req, res) {
  try {
    const rt = req.cookies?.rt;
    if (!rt)
      return sendResponse(res, { code: 401, message: "No refresh token" });
    const payload = jwt.verify(rt, process.env.JWT_SECRET);
    if (payload?.type !== "refresh") throw new Error("Invalid token type");
    const user = await User.findByPk(payload.sub);
    if (!user)
      return sendResponse(res, { code: 401, message: "User not found" });
    if ((user.tokenVersion || 0) !== (payload.tv || 0))
      return sendResponse(res, { code: 401, message: "Token revoked" });
    const access = jwt.sign(
      {
        id: user.id,
        sub: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
        tv: user.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: `${ACCESS_MIN}m` }
    );
    const newRt = jwt.sign(
      { sub: user.id, tv: user.tokenVersion || 0, type: "refresh" },
      process.env.JWT_SECRET,
      { expiresIn: `${REFRESH_DAYS}d` }
    );
    setRefreshCookie(res, newRt, req);
    return sendResponse(res, { code: 200, data: { token: access } });
  } catch {
    return sendResponse(res, { code: 401, message: "Refresh failed" });
  }
}
