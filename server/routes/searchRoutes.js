// routes/searchRoutes.js
import express from "express";
import { searchBooks } from "../controllers/searchController.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const router = express.Router();
router.get("/search", optionalAuth, ctrlWrapper(searchBooks));
export default router;
