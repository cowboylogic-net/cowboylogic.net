import express from "express";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import Page from "../models/Page.js";
import HttpError from "../helpers/HttpError.js";
import { validateBody } from "../middleware/validateBody.js";
import { draftPageSchema, publishPageSchema } from "../schemas/pageSchemas.js";
import { slugParamSchema } from "../schemas/paramsSchemas.js";
import { validateParams } from "../middleware/validateParams.js";
import { createPageSchema } from "../schemas/pageSchemas.js";
import * as pagesController from "../controllers/pagesController.js";



const router = express.Router();

// 📄 GET page by slug — створює, якщо не існує
router.get(
  "/:slug",
  validateParams(slugParamSchema),
  ctrlWrapper(async (req, res) => {
    const { slug } = req.params;

    let page = await Page.findOne({ where: { slug } });

    if (!page) {
      page = await Page.create({ slug, content: "" });
    }

    res.json(page);
  })
);

// 🔄 GET draft & published versions
router.get(
  "/:slug/versions",
  protect,
  isAdmin,
  ctrlWrapper(async (req, res) => {
    const { slug } = req.params;

    const page = await Page.findOne({ where: { slug } });
    if (!page) throw HttpError(404, "Page not found");

    res.json({
      published: page.content,
      draft: page.draftContent,
    });
  })
);

// 💾 PUT save draft content only
router.put(
  "/:slug/draft",
  protect,
  isAdmin,
  validateBody(draftPageSchema),
  ctrlWrapper(async (req, res) => {
    const { slug } = req.params;
    const { draftContent } = req.body;

    let page = await Page.findOne({ where: { slug } });

    if (!page) {
      page = await Page.create({ slug, content: "", draftContent });
      return res.status(201).json({ message: "Draft created" });
    }

    page.draftContent = draftContent;
    await page.save();

    res.json({ message: "Draft updated" });
  })
);

// ✏️ PUT publish content — overrides live version
router.put(
  "/:slug",
  protect,
  isAdmin,
  validateBody(publishPageSchema),
  ctrlWrapper(async (req, res) => {
    const { slug } = req.params;
    const { content } = req.body;

    let page = await Page.findOne({ where: { slug } });

    if (page) {
      page.content = content;
      page.draftContent = null; // опціонально очищаємо чернетку
      await page.save();
      return res.json({ message: "Page updated and published" });
    }

    await Page.create({ slug, content });
    res.status(201).json({ message: "Page created and published" });
  })
);

router.post(
  "/",
  protect,
  isAdmin,
  validateBody(createPageSchema),
  ctrlWrapper(pagesController.createPage)
);

export default router;
