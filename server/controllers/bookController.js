// controllers/bookController.js
import Book from "../models/Book.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import fs from "fs/promises";
import path from "path";
import { Op } from "sequelize";
import sendResponse from "../utils/sendResponse.js";

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

// ✅ GET ALL
const getBooks = async (req, res) => {
  const isPrivileged =
    req.user?.role === "partner" ||
    req.user?.role === "admin" ||
    req.user?.isSuperAdmin;

  const books = await Book.findAll({
    attributes: { exclude: isPrivileged ? [] : ["partnerPrice"] },
  });

  sendResponse(res, { code: 200, data: books });
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

const getPartnerBooks = async (_req, res) => {
  const books = await Book.findAll({
    where: {
      isWholesaleAvailable: true,
      partnerPrice: {
        [Op.ne]: null,
      },
    },
    attributes: [
      "id",
      "title",
      "author",
      "description",
      "partnerPrice",
      "stock",
      "imageUrl",
    ],
  });

  sendResponse(res, {
    code: 200,
    data: books,
  });
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
