import crypto from "crypto";

const DEFAULT_OTP_LENGTH = 6;
const envOtpLength = Number.parseInt(process.env.OTP_LENGTH || "", 10);

export const OTP_LENGTH =
  Number.isInteger(envOtpLength) && envOtpLength > 0
    ? envOtpLength
    : DEFAULT_OTP_LENGTH;

export const generateOtpCode = (len = OTP_LENGTH) => {
  const max = 10 ** len;
  const value = crypto.randomInt(0, max);
  return String(value).padStart(len, "0");
};

export const normalizeOtp = (input) =>
  String(input ?? "")
    .trim()
    .replace(/\s+/g, "");

export const isValidOtpFormat = (otp, len = OTP_LENGTH) =>
  new RegExp(`^\\d{${len}}$`).test(String(otp ?? ""));

