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

  const ATTRS = ["id", "title", "author", "imageUrl", "price"];

  const starts = await Book.findAll({
    attributes: ATTRS,
    where: { title: { [Op.like]: `${q}%` } },
    order: [
      [Sequelize.fn("CHAR_LENGTH", Sequelize.col("title")), "ASC"],
      ["title", "ASC"],
    ],
    limit,
    raw: true,
  });

  if (starts.length >= limit) {
    return sendResponse(res, { code: 200, data: starts });
  }

  const inner = await Book.findAll({
    attributes: ATTRS,
    where: {
      title: { [Op.like]: `%${q}%` },
      id: { [Op.notIn]: starts.map((b) => b.id) },
    },
    order: [
      [Sequelize.fn("CHAR_LENGTH", Sequelize.col("title")), "ASC"],
      ["title", "ASC"],
    ],
    limit: limit - starts.length,
    raw: true,
  });

  return sendResponse(res, { code: 200, data: [...starts, ...inner] });
};
