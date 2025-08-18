import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { logSuperAdminAction } from "../utils/logger.js";
import { formatUser } from "../utils/formatUser.js";
import sendResponse from "../utils/sendResponse.js";

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (req.user.isSuperAdmin) {
    logSuperAdminAction(req.user.email, `Changed role to ${role}`, user.email);
  }

  if (user.isSuperAdmin) {
    throw HttpError(403, "Cannot change role of a super admin");
  }

  user.role = role;
  await user.save();

  sendResponse(res, {
    code: 200,
    message: "User role updated",
    data: formatUser(user),
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.findAll({ order: [["createdAt", "DESC"]] });
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
