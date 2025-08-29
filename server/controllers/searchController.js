// controllers/searchController.js
import { Op, Sequelize } from "sequelize";
import Book from "../models/Book.js";
import sendResponse from "../utils/sendResponse.js";

const escapeLike = (str) => String(str).replace(/[\\%_]/g, (m) => "\\" + m);

export const searchBooks = async (req, res) => {
  const raw = req.query.q ?? "";
  const q = escapeLike(raw.trim());
  const limitParam = Number(req.query.limit ?? 10) || 10;
  const limit = Math.min(Math.max(limitParam, 1), 25); // 1..25

  if (q.length < 2) {
    return sendResponse(res, { code: 200, data: [] });
  }

  // 👇 Додаємо partnerPrice
  const ATTRS = ["id", "title", "author", "imageUrl", "price", "partnerPrice"];
  const isPartner = req.user?.role === "partner";

  const applyRolePrice = (rows) =>
    rows.map(({ partnerPrice, ...rest }) => ({
      ...rest,
      // якщо партнер і є partnerPrice — віддаємо його у полі price
      price: isPartner && partnerPrice != null ? partnerPrice : rest.price,
      // якщо не хочеш світити сире partnerPrice на фронт, не додавай окреме поле
      // partnerPrice, // ← можеш повернути і обидва поля, якщо фронт це очікує
    }));

  const startsRaw = await Book.findAll({
    attributes: ATTRS,
    where: { title: { [Op.like]: `${q}%` } },
    order: [
      [Sequelize.fn("CHAR_LENGTH", Sequelize.col("title")), "ASC"],
      ["title", "ASC"],
    ],
    limit,
    raw: true,
  });
  const starts = applyRolePrice(startsRaw);

  if (starts.length >= limit) {
    return sendResponse(res, { code: 200, data: starts });
  }

  const innerRaw = await Book.findAll({
    attributes: ATTRS,
    where: {
      title: { [Op.like]: `%${q}%` },
      id: { [Op.notIn]: startsRaw.map((b) => b.id) }, // важливо: порівнюємо з raw-IDs
    },
    order: [
      [Sequelize.fn("CHAR_LENGTH", Sequelize.col("title")), "ASC"],
      ["title", "ASC"],
    ],
    limit: limit - starts.length,
    raw: true,
  });
  const inner = applyRolePrice(innerRaw);

  return sendResponse(res, { code: 200, data: [...starts, ...inner] });
};
