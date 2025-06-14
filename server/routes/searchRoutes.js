import express from "express";
import { searchBooks } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", searchBooks);

export default router;
