// controllers/userSelfController.js
import path from "path";
import HttpError from "../helpers/HttpError.js";
import sendResponse from "../utils/sendResponse.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import User from "../models/User.js";
import PartnerProfile from "../models/PartnerProfile.js";
import { formatUser } from "../utils/formatUser.js";
import {
  isCloudinaryProvider,
  uploadBasePath,
} from "../config/imageConfig.js";
import { getPublicBase } from "../config/publicBase.js";
import { destroyImage, uploadImageFromPath } from "../services/cloudinary.js";
import { cleanupTempFileIfNeeded } from "../middleware/uploadMiddleware.js";

const updateAvatar = async (req, res) => {
  if (!req.file?.path) {
    throw HttpError(400, "No avatar uploaded", "UPLOAD_MISSING_FILE");
  }

  const filePath = req.file.path;

  try {
    if (isCloudinaryProvider) {
      const publicId = `cowboylogic/avatars/${req.user.id}/avatar`;
      const uploadResult = await uploadImageFromPath({
        filePath,
        publicId,
        overwrite: true,
        invalidate: true,
        kind: "avatar",
        tags: [
          "resource:avatar",
          `user:${req.user.id}`,
          `env:${process.env.NODE_ENV || "development"}`,
        ],
      });

      req.user.avatarURL = uploadResult.secureUrl;
      req.user.avatarPublicId = uploadResult.publicId;

      try {
        await req.user.save();
      } catch (error) {
        await destroyImage(publicId);
        throw error;
      }

      return sendResponse(res, {
        code: 200,
        data: {
          avatarURL: uploadResult.secureUrl,
          avatarPublicId: uploadResult.publicId,
        },
      });
    }

    let relPath;
    if (req.file.webPath) {
      relPath = req.file.webPath;
    } else {
      const abs = path.resolve(req.file.path || "");
      const relUnderUploads = path.relative(uploadBasePath, abs).replace(/\\/g, "/");
      relPath = "/" + ["uploads", relUnderUploads].join("/");
    }

    req.user.avatarURL = relPath;
    req.user.avatarPublicId = null;
    await req.user.save();

    const absUrl = `${getPublicBase(req)}${relPath}`;

    return sendResponse(res, {
      code: 200,
      data: { avatarURL: absUrl, avatarPublicId: null },
    });
  } finally {
    await cleanupTempFileIfNeeded(filePath);
  }
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
