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
    // якщо передано вручну — використовуємо його
    if (partnerPrice && !isNaN(parseFloat(partnerPrice))) {
      calculatedPartnerPrice = parseFloat(partnerPrice);
    } else {
      calculatedPartnerPrice = +(parsedPrice * 0.75).toFixed(2); // 25% знижка
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
    imageUrl: req.file?.filename
      ? `/uploads/bookCovers/${path.basename(req.file.filename)}`
      : req.body.imageUrl || null,
  };

  const book = await Book.create(newBook);
  sendResponse(res, {
    code: 201,
    data: book,
  });
};

// ✅ UPDATE
const updateBook = async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw HttpError(404, "Book not found");

  const wholesale =
    String(req.body.isWholesaleAvailable).toLowerCase() === "true";
  const parsedPrice = parseFloat(req.body.price);

  let parsedPartnerPrice = null;

  if (wholesale) {
    if (req.body.partnerPrice && !isNaN(parseFloat(req.body.partnerPrice))) {
      parsedPartnerPrice = parseFloat(req.body.partnerPrice);
    } else {
      parsedPartnerPrice = +(parsedPrice * 0.75).toFixed(2);
    }
  }

  const updateData = {
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
    price: parsedPrice,
    partnerPrice: parsedPartnerPrice,
    isWholesaleAvailable: wholesale,
    inStock: String(req.body.inStock).toLowerCase() === "true",
  };

  if (req.body.stock !== undefined) {
    updateData.stock = parseInt(req.body.stock);
  }

  if (req.file) {
    if (book.imageUrl && book.imageUrl.includes("/uploads/")) {
      const relativePath = book.imageUrl.startsWith("/")
        ? book.imageUrl.slice(1)
        : book.imageUrl;
      const oldPath = path.resolve("public", relativePath);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        if (err.code !== "ENOENT")
          console.warn("⚠️ Failed to delete old image:", err.message);
      }
    }

    updateData.imageUrl = `/uploads/bookCovers/${path.basename(
      req.file.filename
    )}`;
  }

  console.log("✏️ Updating book with data:", updateData);

  await book.update(updateData);
  sendResponse(res, {
    code: 200,
    data: book,
  });
};

// ✅ GET ALL
const getBooks = async (req, res) => {
  const isPartner = req.user?.role === "partner";

  const books = await Book.findAll({
    attributes: {
      exclude: isPartner ? [] : ["partnerPrice"],
    },
  });

  sendResponse(res, {
    code: 200,
    data: books,
  });
};

// ✅ GET ONE
const getBookById = async (req, res) => {
  const book = await Book.findByPk(req.params.id);

  if (!book) throw HttpError(404, "Book not found");

  const isPartner = req.user?.role === "partner";

  const bookData = book.toJSON();

  if (!isPartner) {
    delete bookData.partnerPrice;
  }

  sendResponse(res, {
    code: 200,
    data: bookData,
  });
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
const checkBookStock = async (req, res) => {
  const items = req.body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return sendResponse(res, {
      code: 400,
      message: "No items provided",
      data: { success: false },
    });
  }

  for (const item of items) {
    const book = await Book.findByPk(item.bookId);
    if (!book) {
      return sendResponse(res, {
        code: 404,
        message: `Book with ID ${item.bookId} not found`,
        data: { success: false },
      });
    }

    if (book.stock < item.quantity) {
      return sendResponse(res, {
        code: 400,
        message: `Not enough stock for "${book.title}". Available: ${book.stock}, requested: ${item.quantity}`,
        data: { success: false },
      });
    }
  }

  return sendResponse(res, {
    code: 200,
    data: { success: true },
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
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
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
  checkBookStock: ctrlWrapper(checkBookStock),
  getPartnerBooks: ctrlWrapper(getPartnerBooks),
  checkStock: ctrlWrapper(checkStock),
};
