import { Op } from "sequelize";
import Book from "../models/Book.js";
import sendResponse from "../utils/sendResponse.js";

export const searchBooks = async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return sendResponse(res, {
      code: 200,
      data: [],
    });
  }

  const results = await Book.findAll({
    where: {
      title: {
        [Op.like]: `%${query}%`,
      },
    },
    limit: 10,
  });

  sendResponse(res, {
    code: 200,
    data: results,
  });
};
