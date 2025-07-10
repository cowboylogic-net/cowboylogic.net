import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { logSuperAdminAction } from "../utils/logger.js";
import { formatUser } from "../utils/formatUser.js";

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

  res.json({ message: "User role updated", user: formatUser(user) });
};

const getAllUsers = async (req, res) => {
  const users = await User.findAll({ order: [["createdAt", "DESC"]] });
  res.json(users.map(formatUser));
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
  res.json({ message: "User deleted", id });
};

export default {
  getAllUsers: ctrlWrapper(getAllUsers),
  updateUserRole: ctrlWrapper(updateUserRole),
  deleteUser: ctrlWrapper(deleteUser),
};
