import test from "node:test";
import assert from "node:assert/strict";

import {
  getAvailableStock,
  isBookAvailableForPurchase,
} from "../utils/bookAvailability.js";

test("server availability helper normalizes stock and respects inStock", () => {
  assert.equal(getAvailableStock({ stock: "4.9" }), 4);
  assert.equal(isBookAvailableForPurchase({ inStock: true, stock: 4 }, 1), true);
  assert.equal(
    isBookAvailableForPurchase({ inStock: false, stock: 4 }, 1),
    false,
  );
  assert.equal(
    isBookAvailableForPurchase({ inStock: true, stock: 4 }, 5),
    false,
  );
});
