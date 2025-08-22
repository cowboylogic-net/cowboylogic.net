import express from "express";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

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
  requireRole("admin", "superAdmin"),
  ctrlWrapper(async (req, res) => {
    const slug = String(req.params.slug || "").toLowerCase();
    const page = await Page.findOne({ where: { slug } });

    if (!page) throw HttpError(404, "Page not found");
    return sendResponse(res, {
      code: 200,
      data: { published: page.content, draft: page.draftContent },
    });
  })
);

router.put(
  "/:slug/draft",
  protect,
  requireRole("admin", "superAdmin"),
  validateBody(draftPageSchema),
  ctrlWrapper(pagesController.saveDraft)
);

router.put(
  "/:slug",
  protect,
  requireRole("admin", "superAdmin"),
  validateBody(publishPageSchema),
  ctrlWrapper(pagesController.updatePage)
);

router.post(
  "/",
  protect,
  requireRole("admin", "superAdmin"),
  validateBody(createPageSchema),
  ctrlWrapper(pagesController.createPage)
);

export default router;
