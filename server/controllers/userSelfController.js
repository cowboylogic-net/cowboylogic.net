// controllers/userSelfController.js
import HttpError from "../helpers/HttpError.js";
import sendResponse from "../utils/sendResponse.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import User from "../models/User.js";
import PartnerProfile from "../models/PartnerProfile.js";
import { formatUser } from "../utils/formatUser.js";

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

const updateMe = async (req, res) => {
  const { fullName, phoneNumber, newsletter, heardAboutUs } = req.body;
  await req.user.update({ fullName, phoneNumber, newsletter, heardAboutUs });

  const fresh = await User.findByPk(req.user.id, {
    include: [{ association: "partnerProfile", required: false }],
  });
  sendResponse(res, { code: 200, data: formatUser(fresh) });
};

const upsertMyPartnerProfile = async (req, res) => {
  if (req.user.role !== "partner") {
    throw HttpError(403, "Only partners can edit partner profile");
  }

  const existing = await PartnerProfile.findOne({
    where: { userId: req.user.id },
  });

  // якщо профілю нема — вимагаємо organizationName на створення
  if (!existing && !req.body.organizationName) {
    throw HttpError(
      400,
      "organizationName is required to create partner profile"
    );
  }

  const [profile] = existing
    ? [existing]
    : await PartnerProfile.findOrCreate({
        where: { userId: req.user.id },
        defaults: {
          userId: req.user.id,
          organizationName: req.body.organizationName,
        },
      });

  await profile.update({ ...req.body });

  const fresh = await User.findByPk(req.user.id, {
    include: [{ association: "partnerProfile", required: false }],
  });
  sendResponse(res, { code: 200, data: formatUser(fresh) });
};

export default {
  updateAvatar: ctrlWrapper(updateAvatar),
  updateMe: ctrlWrapper(updateMe),
  upsertMyPartnerProfile: ctrlWrapper(upsertMyPartnerProfile),
};
