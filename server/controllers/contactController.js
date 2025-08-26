// controllers/contactController.js
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendResponse from "../utils/sendResponse.js";
import { sendContactEmail as sendContactEmailService } from "../services/emailService.js";

const sendContactEmail = async (req, res) => {
  await sendContactEmailService(req.body);
  sendResponse(res, { code: 200, message: "Message sent successfully" });
};

export default {
  sendContactEmail: ctrlWrapper(sendContactEmail),
};
