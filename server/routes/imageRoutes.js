// routes/images.js
import express from "express";
import { upload, optimizeImage } from "../middleware/uploadMiddleware.js";
import path from "path";

const router = express.Router();

router.post("/upload", upload.single("image"), optimizeImage, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }


  const dir = path.basename(path.dirname(req.file.path));
  const imageUrl = `/uploads/${dir}/${req.file.filename}`;

  res.status(200).json({ imageUrl });
});

export default router;

