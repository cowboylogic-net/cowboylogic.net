import test from "node:test";
import assert from "node:assert/strict";

import bookController from "../controllers/bookController.js";
import Book from "../models/Book.js";

test("partner books response requests and returns inStock for storefront availability", async () => {
  const originalFindAndCountAll = Book.findAndCountAll;

  const expectedRow = {
    id: "book-1",
    title: "Partner Book",
    author: "Author",
    description: "Description",
    partnerPrice: "12.50",
    inStock: true,
    stock: 92,
    imageUrl: "/uploads/book.jpg",
    createdAt: new Date("2026-04-10T00:00:00.000Z"),
    format: "PAPERBACK",
    displayOrder: 0,
    amazonUrl: null,
    downloadUrl: null,
  };

  let capturedOptions = null;

  Book.findAndCountAll = async (options) => {
    capturedOptions = options;
    return { rows: [expectedRow], count: 1 };
  };

  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  const nextCalls = [];

  try {
    await bookController.getPartnerBooks(
      {
        query: {},
        validated: { query: {} },
        user: { role: "partner" },
      },
      res,
      (error) => nextCalls.push(error),
    );
  } finally {
    Book.findAndCountAll = originalFindAndCountAll;
  }

  assert.equal(nextCalls.length, 0);
  assert.ok(Array.isArray(capturedOptions?.attributes));
  assert.ok(capturedOptions.attributes.includes("inStock"));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body?.data?.items?.[0]?.inStock, true);
  assert.equal(res.body?.data?.items?.[0]?.stock, 92);
});
