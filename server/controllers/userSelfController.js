// controllers/userSelfController.js
import HttpError from "../helpers/HttpError.js";
import sendResponse from "../utils/sendResponse.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import User from "../models/User.js";
import PartnerProfile from "../models/PartnerProfile.js";
import { formatUser } from "../utils/formatUser.js";
import path from "path";
import { uploadBasePath } from "../config/imageConfig.js";

const updateAvatar = async (req, res) => {
  if (!req.file) {
    return sendResponse(res, { code: 400, message: "No avatar uploaded" });
  }
  // будуємо "/uploads/..." коректно:
  let relPath;
  if (req.file.webPath) {
    relPath = req.file.webPath; // вже "/uploads/..."
  } else {
    const abs = path.resolve(req.file.path || "");
    const relUnderUploads = path
      .relative(uploadBasePath, abs)
      .replace(/\\/g, "/");
    relPath = "/" + ["uploads", relUnderUploads].join("/");
  }

  // Зберігаємо В БД відносний шлях (стабільно),
  // але у відповіді віддаємо АБСОЛЮТНИЙ для фронта
  req.user.avatarURL = relPath;
  await req.user.save();

  const base = (process.env.BASE_URL || "").replace(/\/+$/, "");
  const absUrl = base ? `${base}${relPath}` : relPath;

  return sendResponse(res, { code: 200, data: { avatarURL: absUrl } });
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
