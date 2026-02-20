import { v2 as cloudinary } from "cloudinary";
import HttpError from "../helpers/HttpError.js";
import { isCloudinaryProvider } from "./imageConfig.js";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export const assertCloudinaryConfigured = () => {
  if (!isCloudinaryProvider) return;

  if (!cloudName || !apiKey || !apiSecret) {
    throw HttpError(
      500,
      "Cloudinary environment variables are not configured",
      "CLOUDINARY_CONFIG_MISSING",
    );
  }
};

export { cloudinary };
