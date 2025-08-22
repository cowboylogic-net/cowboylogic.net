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


  const avatarURL =
    req.file.webPath /* якщо мідлвара вже поклала готовий веб-шлях */ ||
    "/" +
      String(req.file.path || "")
        .replace(/^.*?public[\\/]/, "") // відкинути все до public/
        .replace(/\\/g, "/"); // Windows -> POSIX

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
