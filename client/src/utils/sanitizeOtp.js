export const OTP_LENGTH = 6;

export const sanitizeOtp = (raw, len = OTP_LENGTH) =>
  String(raw || "")
    .replace(/\D/g, "")
    .slice(0, len);

