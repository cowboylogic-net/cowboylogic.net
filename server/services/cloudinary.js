import HttpError from "../helpers/HttpError.js";
import { assertCloudinaryConfigured, cloudinary } from "../config/cloudinary.js";

const TRANSFORMATIONS_BY_KIND = {
  avatar: [
    {
      crop: "fill",
      gravity: "auto",
      width: 512,
      height: 512,
      fetch_format: "auto",
      quality: "auto",
    },
  ],
  book: [
    {
      crop: "limit",
      width: 1400,
      fetch_format: "auto",
      quality: "auto",
    },
  ],
  editor: [
    {
      crop: "limit",
      width: 1600,
      fetch_format: "auto",
      quality: "auto",
      flags: "strip_profile",
    },
  ],
};

export const uploadImageFromPath = async ({
  filePath,
  publicId,
  overwrite,
  invalidate,
  kind,
  tags = [],
}) => {
  assertCloudinaryConfigured();

  const transformation =
    TRANSFORMATIONS_BY_KIND[kind] || TRANSFORMATIONS_BY_KIND.editor;

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      public_id: publicId,
      overwrite,
      invalidate,
      transformation,
      tags,
    });

    return {
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    };
  } catch (error) {
    throw HttpError(502, "Cloudinary upload failed", {
      code: "CLOUDINARY_ERROR",
      details: error?.message ? [{ message: error.message }] : undefined,
    });
  }
};

export const destroyImage = async (publicId) => {
  assertCloudinaryConfigured();
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch {
    // best-effort cleanup
  }
};
