// controllers/userSelfController.js
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendResponse from "../utils/sendResponse.js";

const updateAvatar = async (req, res) => {
  if (!req.file) {
    return sendResponse(res, {
      code: 400,
      message: "No avatar uploaded",
    });
  }

  // ✅ Зберігаємо вже сформований шлях — /uploads/avatars/optimized-файл.webp
  const avatarURL = `/${req.file.filename}`;

  req.user.avatarURL = avatarURL;
  await req.user.save();

  sendResponse(res, {
    code: 200,
    data: { avatarURL },
  });
};

export default {
  updateAvatar: ctrlWrapper(updateAvatar),
};
