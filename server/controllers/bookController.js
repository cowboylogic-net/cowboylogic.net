// controllers/bookController.js
import Book from "../models/Book.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import fs from "fs/promises";
import path from "path";

// ✅ CREATE
const createBook = async (req, res) => {
  const { title, author, description, price, inStock } = req.body;

  const newBook = {
  title,
  author,
  description,
  price,
  inStock: inStock === "true" || inStock === true,
  imageUrl: req.file?.filename
    ? `/uploads/bookCovers/${path.basename(req.file.filename)}`
    : req.body.imageUrl || null,
};


  const book = await Book.create(newBook);
  res.status(201).json(book);
};

// ✅ UPDATE
const updateBook = async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw HttpError(404, "Book not found");

  const updateData = {
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
    price: req.body.price,
    inStock: req.body.inStock === "true" || req.body.inStock === true,
  };

  // 🧹 Видаляємо стару локальну картинку, якщо є
  if (req.file) {
  if (book.imageUrl && book.imageUrl.includes("/uploads/")) {
    const relativePath = book.imageUrl.startsWith("/")
      ? book.imageUrl.slice(1)
      : book.imageUrl;

    const oldPath = path.resolve("public", relativePath);
    try {
      await fs.unlink(oldPath);
      console.log("🧹 Deleted old image:", oldPath);
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.warn("⚠️ Failed to delete old image:", err.message);
      }
    }
  }

  updateData.imageUrl = `/uploads/bookCovers/${path.basename(req.file.filename)}`;
}

   await book.update(updateData);
  res.json(book);
};

// ✅ GET ALL
const getBooks = async (_req, res) => {
  const books = await Book.findAll();
  res.json(books);
};

// ✅ GET ONE
const getBookById = async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw HttpError(404, "Book not found");
  res.json(book);
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
  res.json({ message: "Book deleted" });
};

export default {
  createBook: ctrlWrapper(createBook),
  getBooks: ctrlWrapper(getBooks),
  getBookById: ctrlWrapper(getBookById),
  updateBook: ctrlWrapper(updateBook),
  deleteBook: ctrlWrapper(deleteBook),
};
