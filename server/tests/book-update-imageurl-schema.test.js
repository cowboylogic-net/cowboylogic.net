import test from "node:test";
import assert from "node:assert/strict";
import { updateBookSchema } from "../schemas/bookSchema.js";

test("updateBookSchema accepts https imageUrl", () => {
  const { error, value } = updateBookSchema.validate({
    imageUrl: "https://cdn.example.com/cover.jpg",
  });

  assert.equal(error, undefined);
  assert.equal(value.imageUrl, "https://cdn.example.com/cover.jpg");
});

test("updateBookSchema accepts /uploads relative imageUrl", () => {
  const { error, value } = updateBookSchema.validate({
    imageUrl: "/uploads/books/cover.webp",
  });

  assert.equal(error, undefined);
  assert.equal(value.imageUrl, "/uploads/books/cover.webp");
});

test("updateBookSchema rejects non-http schemes for imageUrl", () => {
  const { error } = updateBookSchema.validate({
    imageUrl: "data:image/png;base64,AAAA",
  });

  assert.ok(error);
});

test("updateBookSchema treats whitespace imageUrl as empty string", () => {
  const { error, value } = updateBookSchema.validate({
    imageUrl: "   ",
  });

  assert.equal(error, undefined);
  assert.equal(value.imageUrl, "");
});
