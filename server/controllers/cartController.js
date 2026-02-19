import CartItem from "../models/CartItem.js";
import Book from "../models/Book.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import {
  addToCartSchema,
  updateQuantitySchema,
} from "../schemas/cartSchemas.js";
import sendResponse from "../utils/sendResponse.js";
import { sequelize } from "../config/db.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value) => typeof value === "string" && UUID_RE.test(value);
const toNonNegInt = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const toPlainItems = (items = []) =>
  items.map((item) =>
    typeof item?.toJSON === "function" ? item.toJSON() : item,
  );

const fetchUserCartItems = async ({ userId, isPartner, transaction } = {}) =>
  CartItem.findAll({
    where: { userId },
    order: [["createdAt", "ASC"]],
    include: [
      {
        model: Book,
        attributes: {
          exclude: isPartner ? [] : ["partnerPrice"],
        },
      },
    ],
    ...(transaction ? { transaction } : {}),
  });

const buildCartValidationPayload = (items = []) => {
  const issues = {};

  for (const item of items) {
    const itemKey = item?.id ?? null;
    const bookId = item?.bookId ?? null;

    if (!isUuid(bookId)) {
      if (!issues.invalidId) issues.invalidId = [];
      issues.invalidId.push({ itemKey, bookId });
      continue;
    }

    if (!item?.Book) {
      if (!issues.missingProducts) issues.missingProducts = [];
      issues.missingProducts.push({ itemKey, bookId });
    }
  }

  return issues;
};

const getCart = async (req, res) => {
  const isPartner = req.user?.role === "partner";

  const items = await CartItem.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "ASC"]],
    include: [
      {
        model: Book,
        attributes: {
          exclude: isPartner ? [] : ["partnerPrice"],
        },
      },
    ],
  });

  sendResponse(res, {
    code: 200,
    data: items,
  });
};

const validateCart = async (req, res) => {
  const isPartner = req.user?.role === "partner";
  const userId = req.user.id;
  const items = await fetchUserCartItems({ userId, isPartner });
  const blockingIssues = buildCartValidationPayload(items);
  const hasBlockingIssues = Boolean(
    blockingIssues.invalidId?.length || blockingIssues.missingProducts?.length,
  );
  if (hasBlockingIssues) {
    return sendResponse(res, {
      code: 200,
      data: {
        ok: false,
        code: blockingIssues.invalidId?.length
          ? "CART_CORRUPTED"
          : "CART_VALIDATION_FAILED",
        issues: blockingIssues,
        normalizedItems: toPlainItems(items),
      },
    });
  }

  const repairIssues = {};
  await sequelize.transaction(async (transaction) => {
    for (const item of items) {
      const book = item.Book;
      const requestedQty = toNonNegInt(item?.quantity);
      const availableQty = toNonNegInt(book?.stock);
      const outOfStock = !book?.inStock || availableQty <= 0;

      if (outOfStock) {
        await CartItem.destroy({
          where: { id: item.id, userId },
          transaction,
        });
        if (!repairIssues.removedOutOfStock)
          repairIssues.removedOutOfStock = [];
        repairIssues.removedOutOfStock.push({
          itemId: item.id,
          bookId: item.bookId,
          requestedQty,
          availableQty,
        });
        continue;
      }

      if (requestedQty > availableQty) {
        item.quantity = availableQty;
        await item.save({ transaction });
        if (!repairIssues.qtyAdjusted) repairIssues.qtyAdjusted = [];
        repairIssues.qtyAdjusted.push({
          itemId: item.id,
          bookId: item.bookId,
          fromQty: requestedQty,
          toQty: availableQty,
          availableQty,
        });
      }
    }
  });

  const normalizedItems = await fetchUserCartItems({ userId, isPartner });
  const validation = {
    ok: true,
    normalizedItems: toPlainItems(normalizedItems),
  };
  if (
    repairIssues.qtyAdjusted?.length ||
    repairIssues.removedOutOfStock?.length
  ) {
    validation.issues = repairIssues;
  }

  sendResponse(res, {
    code: 200,
    data: validation,
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
    await existing.reload({
      include: [
        {
          model: Book,
          attributes: {
            exclude: isPartner ? [] : ["partnerPrice"],
          },
        },
      ],
    });

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

  await item.reload({
    include: [
      {
        model: Book,
        attributes: {
          exclude: isPartner ? [] : ["partnerPrice"],
        },
      },
    ],
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

  const item = await CartItem.findByPk(itemId, {
    include: [
      {
        model: Book,
        attributes: {
          exclude: isPartner ? [] : ["partnerPrice"],
        },
      },
    ],
  });

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

  await item.reload({
    include: [
      {
        model: Book,
        attributes: {
          exclude: isPartner ? [] : ["partnerPrice"],
        },
      },
    ],
  });

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
  validateCart: ctrlWrapper(validateCart),
  addToCart: ctrlWrapper(addToCart),
  updateQuantity: ctrlWrapper(updateQuantity),
  deleteItem: ctrlWrapper(deleteItem),
  clearCart: ctrlWrapper(clearCart),
};
