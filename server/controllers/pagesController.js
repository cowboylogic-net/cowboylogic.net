// controllers/pagesController.js
import Page from "../models/Page.js";
import HttpError from "../helpers/HttpError.js";
import sanitizeHtml from "sanitize-html";
import sendResponse from "../utils/sendResponse.js";

const sanitizeOptions = {
  allowedTags: [
    "b",
    "i",
    "u",
    "s",
    "em",
    "strong",
    "p",
    "ul",
    "ol",
    "li",
    "a",
    "br",
    "blockquote",
    "pre",
    "code",
    "h1",
    "h2",
    "h3",
    "hr",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "width", "height", "style", "alt"],
    td: ["colspan", "rowspan", "style"],
    th: ["colspan", "rowspan", "style"],
    table: ["style"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedStyles: {
    "*": { "text-align": [/^(left|right|center|justify)$/] },
    img: {
      width: [/^\d+(px|%)$/],
      height: [/^\d+(px|%)$/],
      "max-width": [/^\d+%$/],
    },
    table: { width: [/^\d+(px|%)$/] },
    td: { width: [/^\d+(px|%)$/] },
    th: { width: [/^\d+(px|%)$/] },
  },
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs && attribs.target === "_blank") {
        const relParts = (attribs.rel || "").split(/\s+/).filter(Boolean);
        if (!relParts.includes("noopener")) relParts.push("noopener");
        if (!relParts.includes("noreferrer")) relParts.push("noreferrer");
        attribs.rel = relParts.join(" ");
      }
      return { tagName, attribs };
    },
  },
};

const isAdminUser = (user) =>
  !!user &&
  (user.role === "admin" ||
    user.role === "superAdmin" ||
    user.isSuperAdmin === true);

// GET /pages/:slug
export const getPage = async (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase(); // ⬅️ нормалізація
  const admin = isAdminUser(req.user);
  const allowCreateFlag = String(req.query.create || "") === "1";

  let page = await Page.findOne({ where: { slug } });

  if (!page) {
    // прозора логіка create=1
    if (allowCreateFlag && !admin)
      throw HttpError(403, "Only admins can create pages");
    if (allowCreateFlag && admin) {
      page = await Page.create({ slug, content: "" });
    } else {
      throw HttpError(404, "Page not found");
    }
  }

  const plain = page.toJSON();
  if (!admin) {
  delete plain.draftContent;
  res.set("Cache-Control", "public, max-age=60");
  res.set("Vary", "Authorization"); // щоб кеш не змішував гостьові й адмінські відповіді
}


  sendResponse(res, { code: 200, data: plain });
};

// POST /pages
export const createPage = async (req, res) => {
  let { slug, content = "" } = req.body;
  slug = String(slug || "").toLowerCase();

  const existing = await Page.findOne({ where: { slug } });
  if (existing) throw HttpError(400, "Page already exists");

  const page = await Page.create({
    slug,
    content: sanitizeHtml(content || "", sanitizeOptions),
  });

  const plain = page.toJSON();
  // draftContent навряд чи потрібен у відповіді щойно створеної сторінки, але залишимо як є (null)

  sendResponse(res, { code: 201, data: plain });
};

// PUT /pages/:slug
export const updatePage = async (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();

  const { content } = req.body;

  const cleanContent = sanitizeHtml(content || "", sanitizeOptions);
  let page = await Page.findOne({ where: { slug } });

  if (page) {
    page.content = cleanContent;
    page.draftContent = null;
    await page.save();
    const plain = page.toJSON();
    sendResponse(res, { code: 200, message: "Page updated", data: plain });
    return;
  }

  page = await Page.create({ slug, content: cleanContent });
  const plain = page.toJSON();
  sendResponse(res, { code: 201, message: "Page created", data: plain });
};

// PUT /pages/:slug/draft
export const saveDraft = async (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();
  const { draftContent = "" } = req.body;
  const cleanDraft = sanitizeHtml(draftContent || "", sanitizeOptions);

  let page = await Page.findOne({ where: { slug } });
  if (!page) page = await Page.create({ slug, content: "" });

  page.draftContent = cleanDraft;
  await page.save();

  const plain = page.toJSON();
  sendResponse(res, { code: 200, message: "Draft saved", data: plain });
};
