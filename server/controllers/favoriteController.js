import Favorite from "../models/Favorite.js";
import Book from "../models/Book.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import sendResponse from "../utils/sendResponse.js";

const isPrivileged = (user) =>
  user?.role === "partner" || user?.role === "admin" || user?.isSuperAdmin;

// ➕ Додати книгу до обраного
const addFavorite = async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

  // Переконуємось, що книга існує (обов’язково для цілісності даних)
  const book = await Book.findByPk(bookId);
  if (!book) throw HttpError(404, "Book not found");

  const [favorite, created] = await Favorite.findOrCreate({
    where: { userId, bookId },
  });

  if (!created) throw HttpError(409, "Already in favorites");

  sendResponse(res, {
    code: 201,
    message: "Added to favorites",
    data: favorite,
  });
};

// ❌ Видалити книгу з обраного
const removeFavorite = async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;

  const deleted = await Favorite.destroy({ where: { userId, bookId } });
  if (!deleted) throw HttpError(404, "Not in favorites");

  sendResponse(res, {
    code: 200,
    message: "Removed from favorites",
  });
};

// 📄 Отримати всі обрані книги юзера
const getFavorites = async (req, res) => {
  const userId = req.user.id;
  const privileged = isPrivileged(req.user);

  const favorites = await Favorite.findAll({
    where: { userId },
    include: [
      {
        model: Book,
        attributes: {
          exclude: privileged ? [] : ["partnerPrice"], // не витікає звичайним
        },
      },
    ],
  });

  // Повертаємо самі Book; фільтруємо на випадок «битих» зв’язків
  const books = favorites.map((f) => f.Book).filter(Boolean);

  sendResponse(res, {
    code: 200,
    data: books,
  });
};

export default {
  addFavorite: ctrlWrapper(addFavorite),
  removeFavorite: ctrlWrapper(removeFavorite),
  getFavorites: ctrlWrapper(getFavorites),
};
