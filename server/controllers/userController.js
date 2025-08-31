import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { logSuperAdminAction } from "../utils/logger.js";
import { formatUser } from "../utils/formatUser.js";
import sendResponse from "../utils/sendResponse.js";

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const role = String(req.body?.role || "")
    .trim()
    .toLowerCase();

  const user = await User.findByPk(id);

  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (req.user.id === user.id) {
    throw HttpError(403, "You cannot change your own role");
  }

  if (req.user.isSuperAdmin) {
    logSuperAdminAction(req.user.email, `Changed role to ${role}`, user.email);
  }

  if (user.isSuperAdmin) {
    throw HttpError(403, "Cannot change role of a super admin");
  }

  if (role === "superadmin") {
    throw HttpError(403, "Cannot assign super admin role");
  }

  user.role = role;

  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  sendResponse(res, {
    code: 200,
    message: "User role updated",
    data: formatUser(user),
  });
};

const getAllUsers = async (req, res) => {
  const rawLimit = req.query?.limit;
  const rawOffset = req.query?.offset;
  const limit = rawLimit
    ? Math.max(1, Math.min(200, Number(rawLimit)))
    : undefined;
  const offset = rawOffset ? Math.max(0, Number(rawOffset)) : undefined;

  const findOpts = { order: [["createdAt", "DESC"]] };
  if (typeof limit === "number") findOpts.limit = limit;
  if (typeof offset === "number") findOpts.offset = offset;
  const users = await User.findAll(findOpts);
  sendResponse(res, {
    code: 200,
    data: users.map(formatUser),
  });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (user.isSuperAdmin) {
    throw HttpError(403, "Cannot delete a super admin");
  }

  if (req.user.id === user.id) {
    throw HttpError(403, "You cannot delete your own account");
  }

  await user.destroy();
  sendResponse(res, {
    code: 200,
    message: "User deleted",
    data: { id },
  });
};

export default {
  getAllUsers: ctrlWrapper(getAllUsers),
  updateUserRole: ctrlWrapper(updateUserRole),
  deleteUser: ctrlWrapper(deleteUser),
};
