import express from "express";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import Page from "../models/Page.js";
import HttpError from "../helpers/HttpError.js";
import { validateBody } from "../middleware/validateBody.js";
import { draftPageSchema, publishPageSchema } from "../schemas/pageSchemas.js";
import { slugParamSchema } from "../schemas/paramsSchemas.js";
import { validateParams } from "../middleware/validateParams.js";
import { createPageSchema } from "../schemas/pageSchemas.js";
import * as pagesController from "../controllers/pagesController.js";
import sendResponse from "../utils/sendResponse.js";

const router = express.Router();

router.get(
  "/:slug",
  validateParams(slugParamSchema),
  optionalAuth,
  ctrlWrapper(pagesController.getPage)
);

router.get(
  "/:slug/versions",
  validateParams(slugParamSchema),
  protect,
  isAdmin,
  ctrlWrapper(async (req, res) => {
    const { slug } = req.params;

    const page = await Page.findOne({ where: { slug } });
    if (!page) throw HttpError(404, "Page not found");

    return sendResponse(res, { code: 200, data: { published: page.content, draft: page.draftContent } });
  })
);


router.put(
  "/:slug/draft",
  protect,
  isAdmin,
  validateBody(draftPageSchema),
  ctrlWrapper(pagesController.saveDraft)
);


router.put(
  "/:slug",
  protect,
  isAdmin,
  validateBody(publishPageSchema),
  ctrlWrapper(pagesController.updatePage)
);

router.post(
  "/",
  protect,
  isAdmin,
  validateBody(createPageSchema),
  ctrlWrapper(pagesController.createPage)
);

export default router;
