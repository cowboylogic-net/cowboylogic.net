import express from "express";
import favoriteController from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { addFavoriteSchema } from "../schemas/favoriteSchema.js";
import { uuidParamSchema } from "../schemas/paramsSchemas.js";
import { validateParams } from "../middleware/validateParams.js";

const router = express.Router();

router.use(protect);

router.get("/", favoriteController.getFavorites);
router.post("/", validateBody(addFavoriteSchema), favoriteController.addFavorite);
router.delete("/:bookId", validateParams(uuidParamSchema), favoriteController.removeFavorite);

export default router;
