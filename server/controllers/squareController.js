// controllers/squareController.js
import { checkoutApi, locationId } from "../services/squareService.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendResponse from "../utils/sendResponse.js";
import crypto from "crypto";
import Joi from "joi";
import Book from "../models/Book.js";
import { Op } from "sequelize";

// ✅ тільки те, що приходить з клієнта
const paymentSchema = Joi.array()
  .items(
    Joi.object({
      bookId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).max(999).required(),
    })
  )
  .min(1)
  .max(100)
  .required()
  .prefs({ abortEarly: true, stripUnknown: { objects: true } });

// Надійне перетворення у центи з рядка/числа
const toCents = (val) => {
  // приймаємо number або string типу "12.34"
  const s = typeof val === "number" ? val.toFixed(2) : String(val);
  const m = s.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!m) throw new Error(`Invalid price format: ${val}`);
  const dollars = BigInt(m[1]);
  const cents = BigInt((m[2] || "0").padEnd(2, "0"));
  return Number(dollars * 100n + cents);
};

// Формуємо лінійні позиції на основі даних з БД
const buildLineItemsFromDB = ({ books, items, isPartner }) => {
  const mapById = new Map(books.map((b) => [b.id, b]));
  return items.map(({ bookId, quantity }) => {
    const book = mapById.get(bookId);
    if (!book) throw HttpError(400, `Book not found: ${bookId}`);

    if (!book.inStock || (book.stock ?? 0) < quantity) {
      throw HttpError(400, `Insufficient stock for "${book.title}"`);
    }

    // Вибір ціни
    const unitPrice =
      isPartner && book.isWholesaleAvailable && book.partnerPrice != null
        ? book.partnerPrice
        : book.price;

    return {
      name: book.title,
      note: book.id,
      quantity: String(quantity),
      basePriceMoney: {
        amount: toCents(unitPrice),
        currency: "USD",
      },
    };
  });
};

const createPaymentHandler = async (req, res) => {
  const { error, value: items } = paymentSchema.validate(req.body);
  if (error) throw HttpError(400, error.details[0].message);

  const { id: userId, role, email } = req.user;
  const isPartner = role === "partner";

  // Підтягнути книги з БД і звірити все на бекенді
  // const ids = items.map((i) => i.bookId);
  const aggregated = items.reduce((acc, { bookId, quantity }) => {
    acc.set(bookId, (acc.get(bookId) || 0) + quantity);
    return acc;
  }, new Map());
  const ids = [...aggregated.keys()];

  // ✅ Перевірка партнера ПІСЛЯ агрегації (мін. 5 на тайтл)
  if (isPartner) {
    const tooSmall = [...aggregated.entries()].find(([, qty]) => qty < 5);
    if (tooSmall) {
      throw HttpError(403, `Partners must order at least 5 items per title`);
    }
  }

  const books = await Book.findAll({
    where: { id: { [Op.in]: ids } },
    attributes: [
      "id",
      "title",
      "price",
      "partnerPrice",
      "isWholesaleAvailable",
      "inStock",
      "stock",
    ],
    raw: true,
  });

  if (books.length !== ids.length) {
    // знайдемо відсутні id для зрозумілого меседжа
    const foundIds = new Set(books.map((b) => b.id));
    const missing = ids.filter((id) => !foundIds.has(id));
    throw HttpError(400, `Some books not found: ${missing.join(", ")}`);
  }
  const itemsNormalized = [...aggregated.entries()].map(
    ([bookId, quantity]) => ({ bookId, quantity })
  );

  const lineItems = buildLineItemsFromDB({
    books,
    items: itemsNormalized, // 👈 замість оригінального items
    isPartner,
  });

  try {
    const checkoutResponse = await checkoutApi.createCheckout(locationId, {
      idempotencyKey: crypto.randomUUID(),
      // ✅ referenceId для зв’язки платежу з користувачем
      order: {
        order: {
          locationId,
          referenceId: String(userId),
          lineItems,
        },
      },
      // Не всі поля підтримуються як metadata в createCheckout.
      // Якщо потрібно саме metadata -> перехід на paymentLinksApi.createPaymentLink
      redirectUrl:
        process.env.NODE_ENV === "production"
          ? process.env.SQUARE_SUCCESS_URL
          : "http://localhost:5173/success",
      // Корисно заповнити емейл
      prePopulateBuyerEmail: email || undefined,
      // Можна додати опції чекауту за потреби (купон, адреса тощо)
    });

    const checkoutUrl = checkoutResponse.result.checkout?.checkoutPageUrl;
    if (!checkoutUrl) {
      throw HttpError(500, "Missing checkout URL from Square");
    }

    return sendResponse(res, { code: 200, data: { checkoutUrl } });
  } catch (err) {
    // SDK Square часто повертає err.body / err.result / err.errors
    console.error(
      "💥 Square error:",
      err?.body || err?.result || err?.message || err
    );
    throw HttpError(500, "Failed to create payment");
  }
};

export const createPaymentLink = ctrlWrapper(createPaymentHandler);
