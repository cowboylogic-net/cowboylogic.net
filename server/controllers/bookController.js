// controllers/bookController.js
import Book from "../models/Book.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import fs from "fs/promises";
import path from "path";
import { Op } from "sequelize";
import sendResponse from "../utils/sendResponse.js";

const ALLOWED_FORMATS = [
  "PAPERBACK",
  "HARDCOVER",
  "EBOOK_EPUB",
  "KINDLE_AMAZON",
  "AUDIOBOOK",
];

const normalizeFormat = (value = "PAPERBACK") => {
  const normalized = String(value || "").toUpperCase();
  if (!ALLOWED_FORMATS.includes(normalized)) {
    throw HttpError(400, "Invalid format");
  }
  return normalized;
};

const createBook = async (req, res) => {
  const {
    title,
    author,
    description,
    price,
    partnerPrice,
    inStock,
    stock,
    isWholesaleAvailable,
    format,
    displayOrder,
    amazonUrl,
    downloadUrl,
  } = req.body;

  const wholesale = String(isWholesaleAvailable).toLowerCase() === "true";
  const parsedPrice = parseFloat(price);

  let calculatedPartnerPrice = null;
  if (wholesale) {
    if (partnerPrice && !isNaN(parseFloat(partnerPrice))) {
      calculatedPartnerPrice = parseFloat(partnerPrice);
    } else {
      calculatedPartnerPrice = +(parsedPrice * 0.75).toFixed(2);
    }
  }

  const normalizedFormat = normalizeFormat(format || "PAPERBACK");

  let normalizedAmazonUrl = typeof amazonUrl === "string" ? amazonUrl.trim() : amazonUrl;
  let normalizedDownloadUrl =
    typeof downloadUrl === "string" ? downloadUrl.trim() : downloadUrl;

  if (normalizedFormat === "KINDLE_AMAZON") {
    if (!normalizedAmazonUrl) {
      throw HttpError(400, "Amazon URL is required for Kindle books");
    }
    normalizedDownloadUrl = null;
  } else {
    normalizedAmazonUrl = normalizedAmazonUrl || null;
    if (normalizedFormat === "EBOOK_EPUB" || normalizedFormat === "AUDIOBOOK") {
      normalizedDownloadUrl = normalizedDownloadUrl || null;
    } else {
      normalizedDownloadUrl = null;
    }
  }

  const parsedDisplayOrderRaw = Number.parseInt(displayOrder, 10);
  const parsedDisplayOrder =
    Number.isNaN(parsedDisplayOrderRaw) || parsedDisplayOrderRaw < 0
      ? 0
      : parsedDisplayOrderRaw;

  const newBook = {
    title,
    author,
    description,
    price: parsedPrice,
    partnerPrice: calculatedPartnerPrice,
    isWholesaleAvailable: wholesale,
    inStock: String(inStock).toLowerCase() === "true",
    stock: parseInt(stock) || 0,
    imageUrl: req.file?.webPath || req.body.imageUrl || null, // ✅ головне
    format: normalizedFormat,
    displayOrder: parsedDisplayOrder,
    amazonUrl: normalizedAmazonUrl,
    downloadUrl: normalizedDownloadUrl,
  };

  const book = await Book.create(newBook);
  sendResponse(res, { code: 201, data: book });
};

// ✅ UPDATE
// ✅ UPDATE (drop-in replacement)
const updateBook = async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw HttpError(404, "Book not found");

  // побудова updateData лише з наданих ключів
  const updateData = {};

  if ("title" in req.body) updateData.title = req.body.title;
  if ("author" in req.body) updateData.author = req.body.author;
  if ("description" in req.body) updateData.description = req.body.description;

  if ("price" in req.body) {
    const p = parseFloat(req.body.price);
    if (Number.isNaN(p)) throw HttpError(400, "Invalid price");
    updateData.price = p;
  }

  if ("stock" in req.body) {
    const s = parseInt(req.body.stock);
    if (Number.isNaN(s) || s < 0) throw HttpError(400, "Invalid stock");
    updateData.stock = s;
  }

  if ("inStock" in req.body) {
    updateData.inStock = String(req.body.inStock).toLowerCase() === "true";
  }

  if ("isWholesaleAvailable" in req.body) {
    const wholesale =
      String(req.body.isWholesaleAvailable).toLowerCase() === "true";
    updateData.isWholesaleAvailable = wholesale;

    if (wholesale) {
      if ("partnerPrice" in req.body) {
        const pp = parseFloat(req.body.partnerPrice);
        if (Number.isNaN(pp)) throw HttpError(400, "Invalid partnerPrice");
        updateData.partnerPrice = pp;
      } else if ("price" in updateData) {
        updateData.partnerPrice = +(updateData.price * 0.75).toFixed(2);
      }
    } else {
      // wholesale вимкнули → обнуляємо partnerPrice
      updateData.partnerPrice = null;
    }
  } else if ("partnerPrice" in req.body) {
    // wholesale не змінювали, але надійшов partnerPrice
    const pp = parseFloat(req.body.partnerPrice);
    if (Number.isNaN(pp)) throw HttpError(400, "Invalid partnerPrice");
    updateData.partnerPrice = pp;
  }

  let nextFormat = book.format;
  if ("format" in req.body) {
    nextFormat = normalizeFormat(req.body.format);
    updateData.format = nextFormat;
  }

  if ("displayOrder" in req.body) {
    const parsedDisplayOrder = parseInt(req.body.displayOrder, 10);
    if (Number.isNaN(parsedDisplayOrder) || parsedDisplayOrder < 0) {
      throw HttpError(400, "Invalid displayOrder");
    }
    updateData.displayOrder = parsedDisplayOrder;
  }

  let nextAmazonUrl = book.amazonUrl;
  if ("amazonUrl" in req.body) {
    const trimmed =
      typeof req.body.amazonUrl === "string" ? req.body.amazonUrl.trim() : req.body.amazonUrl;
    nextAmazonUrl = trimmed || null;
    updateData.amazonUrl = nextAmazonUrl;
  }

  let nextDownloadUrl = book.downloadUrl;
  if ("downloadUrl" in req.body) {
    const trimmed =
      typeof req.body.downloadUrl === "string"
        ? req.body.downloadUrl.trim()
        : req.body.downloadUrl;
    nextDownloadUrl = trimmed || null;
    updateData.downloadUrl = nextDownloadUrl;
  }

  if (!("format" in req.body)) {
    nextFormat = book.format;
  }

  if (!("amazonUrl" in req.body)) {
    nextAmazonUrl = book.amazonUrl;
  }

  if (!("downloadUrl" in req.body)) {
    nextDownloadUrl = book.downloadUrl;
  }

  if (nextFormat === "KINDLE_AMAZON") {
    if (!nextAmazonUrl) {
      throw HttpError(400, "Amazon URL is required for Kindle books");
    }
    updateData.amazonUrl = nextAmazonUrl;
    updateData.downloadUrl = null;
  } else if (nextFormat === "EBOOK_EPUB" || nextFormat === "AUDIOBOOK") {
    updateData.amazonUrl = nextAmazonUrl || null;
    updateData.downloadUrl = nextDownloadUrl || null;
  } else {
    updateData.amazonUrl = nextAmazonUrl || null;
    updateData.downloadUrl = null;
  }

  // 🖼️ якщо прийшов новий файл — видаляємо старий /uploads/* і ставимо новий шлях
  if (req.file?.webPath) {
    if (book.imageUrl && book.imageUrl.startsWith("/uploads/")) {
      const relativePath = book.imageUrl.slice(1); // прибираємо початковий "/"
      const oldPath = path.resolve("public", relativePath);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.warn("⚠️ Failed to delete old image:", err.message);
        }
      }
    }
    updateData.imageUrl = req.file.webPath;
  }

  await book.update(updateData);
  sendResponse(res, { code: 200, data: book });
};

// controllers/bookController.js
const getBooks = async (req, res) => {
  const isPrivileged =
    req.user?.role === "partner" ||
    req.user?.role === "admin" ||
    req.user?.isSuperAdmin;

  // 1) беремо з мідлвара, якщо є
  const q = (req.validated && req.validated.query) || req.query || {};

  // 2) будуємо whitelist для сорту з урахуванням наявності поля createdAt
  const attrs = Book.rawAttributes || Book.getAttributes?.() || {};
  const allowedSort = new Set(["title", "price", "stock"]);
  if ("createdAt" in attrs) allowedSort.add("createdAt");
  if ("displayOrder" in attrs) allowedSort.add("displayOrder");

  const sortByRaw = q.sortBy ?? "createdAt";
  const sortBy = allowedSort.has(sortByRaw) ? sortByRaw : [...allowedSort][0];

  const orderRaw = String(q.order ?? "desc").toUpperCase();
  const order = orderRaw === "ASC" ? "ASC" : "DESC";

  const pageNum = Number.parseInt(q.page, 10);
  const limitNum = Number.parseInt(q.limit, 10);
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
  const limit = Number.isFinite(limitNum)
    ? Math.min(Math.max(limitNum, 1), 50)
    : 12;
  const offset = (page - 1) * limit;

  const { rows, count } = await Book.findAndCountAll({
    attributes: { exclude: isPrivileged ? [] : ["partnerPrice"] },
    limit,
    offset,
    order: [[sortBy, order]],
  });

  const totalPages = Math.max(1, Math.ceil(count / limit));
  const meta = {
    page,
    limit,
    totalItems: count,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    sortBy,
    order: order.toLowerCase(),
  };

  sendResponse(res, { code: 200, data: { items: rows, meta } });
};

// ✅ GET ONE
const getBookById = async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw HttpError(404, "Book not found");

  const isPrivileged =
    req.user?.role === "partner" ||
    req.user?.role === "admin" ||
    req.user?.isSuperAdmin;
  const bookData = book.toJSON();
  if (!isPrivileged) delete bookData.partnerPrice;

  sendResponse(res, { code: 200, data: bookData });
};

// ✅ DELETE
const deleteBook = async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw HttpError(404, "Book not found");

  // 🧹 Видаляємо зображення, якщо є
  if (book.imageUrl && book.imageUrl.includes("/uploads/")) {
    const relativePath = book.imageUrl.startsWith("/")
      ? book.imageUrl.slice(1)
      : book.imageUrl;
    const filePath = path.resolve("public", relativePath);

    try {
      await fs.unlink(filePath);
      console.log("🗑️ Deleted image:", filePath);
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.warn("⚠️ Failed to delete image:", err.message);
      }
    }
  }

  await book.destroy();
  sendResponse(res, {
    code: 200,
    message: "Book deleted",
  });
};

const getPartnerBooks = async (req, res) => {
  const q = (req.validated && req.validated.query) || req.query || {};

  const allowedSort = new Set(["createdAt", "title", "partnerPrice", "stock", "displayOrder"]);
  const sortByRaw = q.sortBy ?? "createdAt";
  const sortBy = allowedSort.has(sortByRaw) ? sortByRaw : "createdAt";

  const orderRaw = String(q.order ?? "desc").toUpperCase();
  const order = orderRaw === "ASC" ? "ASC" : "DESC";

  const pageNum = parseInt(q.page, 10);
  const limitNum = parseInt(q.limit, 10);
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
  const limit = Number.isFinite(limitNum)
    ? Math.min(Math.max(limitNum, 1), 50)
    : 12;
  const offset = (page - 1) * limit;

  const where = {
    isWholesaleAvailable: true,
    partnerPrice: { [Op.ne]: null },
  };

  const { rows, count } = await Book.findAndCountAll({
    where,
    attributes: [
      "id",
      "title",
      "author",
      "description",
      "partnerPrice",
      "stock",
      "imageUrl",
      "createdAt",
      "format",
      "displayOrder",
      "amazonUrl",
      "downloadUrl",
    ],
    limit,
    offset,
    order: [[sortBy, order]],
  });

  const totalPages = Math.max(1, Math.ceil(count / limit));
  const meta = {
    page,
    limit,
    totalItems: count,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    sortBy,
    order: order.toLowerCase(),
  };

  sendResponse(res, { code: 200, data: { items: rows, meta } });
};

const checkStock = async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : req.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw HttpError(400, "Invalid items format");
  }

  for (const item of items) {
    const book = await Book.findByPk(item.bookId);
    if (!book) {
      return sendResponse(res, {
        code: 200,
        message: `Book not found: ${item.bookId}`,
        data: { success: false },
      });
    }
    if (book.stock < item.quantity) {
      return sendResponse(res, {
        code: 200,
        message: `"${book.title}" only has ${book.stock} in stock.`,
        data: { success: false },
      });
    }
  }

  sendResponse(res, {
    code: 200,
    data: { success: true },
  });
};

export default {
  createBook: ctrlWrapper(createBook),
  getBooks: ctrlWrapper(getBooks),
  getBookById: ctrlWrapper(getBookById),
  updateBook: ctrlWrapper(updateBook),
  deleteBook: ctrlWrapper(deleteBook),
  getPartnerBooks: ctrlWrapper(getPartnerBooks),
  checkStock: ctrlWrapper(checkStock),
};
