import CartItem from "../models/CartItem.js";
import Book from "../models/Book.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import {
  addToCartSchema,
  updateQuantitySchema,
} from "../schemas/cartSchemas.js";
import sendResponse from "../utils/sendResponse.js";

const getCart = async (req, res) => {
  const items = await CartItem.findAll({
    where: { userId: req.user.id },
    include: Book,
  });
  sendResponse(res, {
    code: 200,
    data: items,
  });
};

const addToCart = async (req, res) => {
  const { error, value } = addToCartSchema.validate(req.body);
  if (error) throw HttpError(400, error.details[0].message);

  const { bookId, quantity } = value;
  const isPartner = req.user.role === "partner";

  const book = await Book.findByPk(bookId);
  if (!book) throw HttpError(404, "Book not found");

  if (isPartner && quantity < 5) {
    throw HttpError(400, "Partners must order at least 5 items");
  }

  const existing = await CartItem.findOne({
    where: { userId: req.user.id, bookId },
  });

  if (existing) {
    const newQuantity = existing.quantity + quantity;

    if (isPartner && newQuantity < 5) {
      throw HttpError(400, "Partners must have at least 5 total items");
    }

    if (book.stock < newQuantity) {
      throw HttpError(400, `Only ${book.stock} items left in stock`);
    }

    existing.quantity = newQuantity;
    await existing.save();
    return sendResponse(res, {
      code: 200,
      data: existing,
    });
  }

  if (book.stock < quantity) {
    throw HttpError(400, `Only ${book.stock} items left in stock`);
  }

  const item = await CartItem.create({
    userId: req.user.id,
    bookId,
    quantity,
  });

  sendResponse(res, {
    code: 201,
    data: item,
  });
};

const updateQuantity = async (req, res) => {
  const { error, value } = updateQuantitySchema.validate(req.body);
  if (error) throw HttpError(400, error.details[0].message);

  const { quantity } = value;
  const { itemId } = req.params;
  const isPartner = req.user.role === "partner";

  const item = await CartItem.findByPk(itemId, { include: Book });

  if (!item || item.userId !== req.user.id) {
    throw HttpError(404, "Cart item not found");
  }

  if (isPartner && quantity < 5) {
    throw HttpError(400, "Partners must order at least 5 items");
  }

  if (item.Book.stock < quantity) {
    throw HttpError(400, `Only ${item.Book.stock} items left in stock`);
  }

  item.quantity = quantity;
  await item.save();
  sendResponse(res, {
    code: 200,
    data: item,
  });
};

const deleteItem = async (req, res) => {
  const { itemId } = req.params;

  const item = await CartItem.findByPk(itemId);

  if (!item || item.userId !== req.user.id) {
    throw HttpError(404, "Cart item not found");
  }

  await item.destroy();
  sendResponse(res, {
  code: 200,
  message: "Item deleted",
});

};

const clearCart = async (req, res) => {
  await CartItem.destroy({ where: { userId: req.user.id } });
  sendResponse(res, {
    code: 200,
    message: "Cart cleared",
  });
};

export default {
  getCart: ctrlWrapper(getCart),
  addToCart: ctrlWrapper(addToCart),
  updateQuantity: ctrlWrapper(updateQuantity),
  deleteItem: ctrlWrapper(deleteItem),
  clearCart: ctrlWrapper(clearCart),
};
