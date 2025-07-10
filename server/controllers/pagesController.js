import Page from "../models/Page.js";
import HttpError from "../helpers/HttpError.js";
import sanitizeHtml from "sanitize-html";

export const getPage = async (req, res) => {
  const { slug } = req.params;

  let page = await Page.findOne({ where: { slug } });

  // ✅ Створюємо сторінку, якщо не існує
  if (!page) {
    page = await Page.create({ slug, content: "" });
  }

  const plain = page.toJSON();

  // ❗ Ховаємо draftContent, якщо не авторизований адмін
  if (!req.user?.isAdmin) {
    delete plain.draftContent;
  }

  res.json(plain);
};

export const createPage = async (req, res) => {
  const { slug, content } = req.body;

  const existing = await Page.findOne({ where: { slug } });
  if (existing) throw HttpError(400, "Page already exists");

  const page = await Page.create({ slug, content });
  res.status(201).json(page);
};

export const updatePage = async (req, res) => {
  const { slug } = req.params;
  const { content } = req.body;

  const cleanContent = sanitizeHtml(content, {
    allowedTags: ["b", "i", "em", "strong", "p", "ul", "ol", "li", "a"],
    allowedAttributes: { a: ["href"] },
  });

  let page = await Page.findOne({ where: { slug } });

  if (page) {
    page.content = cleanContent;
    await page.save();
    return res.json({ message: "Page updated" });
  }

  await Page.create({ slug, content: cleanContent });
  res.status(201).json({ message: "Page created" });
};
