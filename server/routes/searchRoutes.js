// routes/searchRoutes.js
import express from "express";
import { searchBooks } from "../controllers/searchController.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";

const router = express.Router();
router.get("/search", ctrlWrapper(searchBooks));
export default router;
