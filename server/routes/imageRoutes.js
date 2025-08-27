// routes/imageRoutes.js
import express from "express";
import { upload, optimizeImage } from "../middleware/uploadMiddleware.js";
import sendResponse from "../utils/sendResponse.js";

const router = express.Router();

router.post("/upload", upload.single("image"), optimizeImage, (req, res) => {
  if (!req.file) {
    return sendResponse(res, { code: 400, message: "No file uploaded" });
  }

  // 1) База з поточного запиту (працює і локально, і на проді)
  const base = `${req.protocol}://${req.get("host")}`.replace(/\/+$/, "");

  // 2) Відносний шлях: беремо те, що виставила мідлвара, або будуємо самі
  //    (припускаємо, що файли лежать у public/uploads)
  const rel = req.file.webPath || `/uploads/${req.file.filename}`; 

  // 3) Якщо мідлвара віддала абсолютний — лишаємо як є
  const imageUrl = /^https?:\/\//i.test(rel) ? rel : `${base}${rel}`;

  return sendResponse(res, { code: 200, data: { imageUrl } });
});

export default router;
