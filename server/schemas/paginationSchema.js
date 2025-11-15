import Joi from "joi";

export const booksQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
  sortBy: Joi.string()
    .valid("createdAt", "title", "price", "stock", "displayOrder")
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").insensitive().default("desc"),
});

// ⬇ ДОДАЙ
export const partnerBooksQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
  sortBy: Joi.string()
    .valid("createdAt", "title", "partnerPrice", "stock", "displayOrder")
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").insensitive().default("desc"),
});