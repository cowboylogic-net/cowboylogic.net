import { Op } from "sequelize";
import Book from "../models/Book.js";

export const searchBooks = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const results = await Book.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`
        }
      },
      limit: 10
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};
