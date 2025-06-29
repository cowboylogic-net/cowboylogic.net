// controllers/userSelfController.js
import ctrlWrapper from "../helpers/ctrlWrapper.js";

const updateAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No avatar uploaded" });
  }

  // ✅ Зберігаємо вже сформований шлях — /uploads/avatars/optimized-файл.webp
  const avatarURL = `/${req.file.filename}`;

  req.user.avatarURL = avatarURL;
  await req.user.save();

  res.status(200).json({ avatarURL });
};

export default {
  updateAvatar: ctrlWrapper(updateAvatar),
};
