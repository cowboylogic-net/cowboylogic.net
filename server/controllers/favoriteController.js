import Favorite from "../models/Favorite.js";
import Book from "../models/Book.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import sendResponse from "../utils/sendResponse.js";

// ➕ Додати книгу до обраного
const addFavorite = async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

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

  const favorites = await Favorite.findAll({
    where: { userId },
    include: Book,
  });

  sendResponse(res, {
    code: 200,
    data: favorites.map((f) => f.Book),
  });
};

export default {
  addFavorite: ctrlWrapper(addFavorite),
  removeFavorite: ctrlWrapper(removeFavorite),
  getFavorites: ctrlWrapper(getFavorites),
};
