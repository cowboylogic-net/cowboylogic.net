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
};

export const getPage = async (req, res) => {
  const { slug } = req.params;

  let page = await Page.findOne({ where: { slug } });

  if (!page) {
    page = await Page.create({ slug, content: "" });
  }

  const plain = page.toJSON();

  const isAdminUser =
    req.user &&
    (req.user.role === "admin" ||
      req.user.role === "superAdmin" ||
      req.user?.isSuperAdmin === true);
  if (!isAdminUser) {
    delete plain.draftContent;
  }

  sendResponse(res, {
    code: 200,
    data: plain,
  });
};

export const createPage = async (req, res) => {
  const { slug, content = "" } = req.body;

  const existing = await Page.findOne({ where: { slug } });
  if (existing) throw HttpError(400, "Page already exists");

  const page = await Page.create({
    slug,
    content: sanitizeHtml(content || "", sanitizeOptions),
  });
  sendResponse(res, {
    code: 201,
    data: page,
  });
};

export const updatePage = async (req, res) => {
  const { slug } = req.params;
  const { content } = req.body;

  const cleanContent = sanitizeHtml(content || "", sanitizeOptions);
  let page = await Page.findOne({ where: { slug } });

  if (page) {
    page.content = cleanContent;
    page.draftContent = null;
    await page.save();
    return sendResponse(res, {
      code: 200,
      message: "Page updated",
      data: { slug },
    });
  }

  await Page.create({ slug, content: cleanContent });
  return sendResponse(res, {
    code: 201,
    message: "Page created",
    data: { slug },
  });
};

export const saveDraft = async (req, res) => {
  const { slug } = req.params;
  const { draftContent = "" } = req.body;
  const cleanDraft = sanitizeHtml(draftContent || "", sanitizeOptions);

  let page = await Page.findOne({ where: { slug } });
  if (!page) page = await Page.create({ slug, content: "" });

  page.draftContent = cleanDraft;
  await page.save();

  return sendResponse(res, {
    code: 200,
    message: "Draft saved",
    data: { slug },
  });
};
