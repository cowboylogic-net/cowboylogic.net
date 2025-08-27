// // routes/imageRoutes.js
import express from "express";
import { upload, optimizeImage } from "../middleware/uploadMiddleware.js";
import sendResponse from "../utils/sendResponse.js";

const router = express.Router();


// router.post("/upload", upload.single("image"), optimizeImage, (req, res) => {
//   if (!req.file) {
//     return sendResponse(res, { code: 400, message: "No file uploaded" });
//   }

 
//   const proto = (req.headers["x-forwarded-proto"]?.split(",")[0]) || req.protocol;
//   const host  = req.headers["x-forwarded-host"] || req.get("host");
//   const base  = `${proto}://${host}`.replace(/\/+$/, "");

  
//   const rel = req.file.webPath || `/uploads/${req.file.filename}`;

  
//   const imageUrl = /^https?:\/\//i.test(rel) ? rel : `${base}${rel}`;

//   return sendResponse(res, { code: 200, data: { imageUrl } });
// });


// export default router;
router.post("/upload", upload.single("image"), optimizeImage, (req, res) => {
  if (!req.file) {
    return sendResponse(res, { code: 400, message: "No file uploaded" });
  }

  // ✅ ВАЖЛИВО: повертаємо ТІЛЬКИ відносний шлях
  const rel = req.file.webPath || `/uploads/${req.file.filename}`;

  return sendResponse(res, { code: 200, data: { imageUrl: rel } });
});
export default router;