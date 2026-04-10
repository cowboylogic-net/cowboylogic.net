import test from "node:test";
import assert from "node:assert/strict";

import axios from "../src/store/axios.js";
import {
  addToCartThunk,
  clearCartThunk,
  deleteCartItemThunk,
  updateCartItemQuantity,
} from "../src/store/thunks/cartThunks.js";
import {
  getCheckoutDisabled,
  getClearedBlockingValidationState,
  getValidationTransportFailureResult,
} from "../src/pages/Cart/cartValidationState.js";
import { isBookAvailableForPurchase as isClientBookAvailable } from "../src/utils/bookAvailability.js";
import { isBookAvailableForPurchase as isServerBookAvailable } from "../../server/utils/bookAvailability.js";

const makeItem = ({ id, bookId, quantity, stock = 5, inStock = true }) => ({
  id,
  bookId,
  quantity,
  Book: {
    id: bookId,
    title: `Book ${bookId}`,
    price: 10,
    stock,
    inStock,
  },
});

const runThunk = async (thunk, state) => {
  const actions = [];
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = () => 0;

  const getState = () => state;
  const dispatch = async (action) => {
    if (typeof action === "function") {
      return await action(dispatch, getState, undefined);
    }
    actions.push(action);
    return action;
  };

  try {
    const result = await thunk(dispatch, getState, undefined);
    return { result, actions };
  } finally {
    global.setTimeout = originalSetTimeout;
  }
};

const withPatchedAxios = async (patches, callback) => {
  const originals = {
    get: axios.get,
    post: axios.post,
    patch: axios.patch,
    delete: axios.delete,
  };

  Object.assign(axios, patches);
  try {
    return await callback();
  } finally {
    Object.assign(axios, originals);
  }
};

test("add-to-cart stays fulfilled when add succeeds and immediate reload fails", async () => {
  const addedItem = makeItem({ id: "item-1", bookId: "book-1", quantity: 1 });
  const state = {
    auth: { token: "token", user: { role: "user" } },
    cart: { items: [] },
    books: { books: [] },
  };

  await withPatchedAxios(
    {
      post: async () => ({ data: { data: addedItem, message: "Book added to cart!" } }),
      get: async () => {
        throw new Error("reload failed");
      },
    },
    async () => {
      const { result } = await runThunk(
        addToCartThunk({ bookId: "book-1", quantity: 1 }),
        state,
      );

      assert.equal(addToCartThunk.fulfilled.match(result), true);
      assert.deepEqual(result.payload, [addedItem]);
    },
  );
});

test("quantity update stays fulfilled when patch succeeds and immediate reload fails", async () => {
  const existingItem = makeItem({ id: "item-1", bookId: "book-1", quantity: 1 });
  const updatedItem = makeItem({ id: "item-1", bookId: "book-1", quantity: 3 });
  const state = {
    auth: { token: "token", user: { role: "user" } },
    cart: { items: [existingItem] },
    books: { books: [] },
  };

  await withPatchedAxios(
    {
      patch: async () => ({ data: { data: updatedItem } }),
      get: async () => {
        throw new Error("reload failed");
      },
    },
    async () => {
      const { result } = await runThunk(
        updateCartItemQuantity({ itemId: "item-1", quantity: 3 }),
        state,
      );

      assert.equal(updateCartItemQuantity.fulfilled.match(result), true);
      assert.deepEqual(result.payload, [updatedItem]);
    },
  );
});

test("delete stays fulfilled when delete succeeds and immediate reload fails", async () => {
  const keptItem = makeItem({ id: "item-2", bookId: "book-2", quantity: 1 });
  const deletedItem = makeItem({ id: "item-1", bookId: "book-1", quantity: 1 });
  const state = {
    auth: { token: "token", user: { role: "user" } },
    cart: { items: [deletedItem, keptItem] },
    books: { books: [] },
  };

  await withPatchedAxios(
    {
      delete: async () => ({ data: { message: "Item deleted" } }),
      get: async () => {
        throw new Error("reload failed");
      },
    },
    async () => {
      const { result } = await runThunk(deleteCartItemThunk("item-1"), state);

      assert.equal(deleteCartItemThunk.fulfilled.match(result), true);
      assert.deepEqual(result.payload, [keptItem]);
    },
  );
});

test("clear-cart stays fulfilled when delete succeeds and immediate reload fails", async () => {
  const state = {
    auth: { token: "token", user: { role: "user" } },
    cart: {
      items: [
        makeItem({ id: "item-1", bookId: "book-1", quantity: 1 }),
        makeItem({ id: "item-2", bookId: "book-2", quantity: 2 }),
      ],
    },
    books: { books: [] },
  };

  await withPatchedAxios(
    {
      delete: async () => ({ data: { message: "Cart cleared" } }),
      get: async () => {
        throw new Error("reload failed");
      },
    },
    async () => {
      const { result } = await runThunk(clearCartThunk(), state);

      assert.equal(clearCartThunk.fulfilled.match(result), true);
      assert.deepEqual(result.payload, []);
    },
  );
});

test("validation transport failure clears blocking state instead of latching checkout disabled", () => {
  const clearedState = getClearedBlockingValidationState();
  const failureResult = getValidationTransportFailureResult([
    makeItem({ id: "item-1", bookId: "book-1", quantity: 1 }),
  ]);

  assert.deepEqual(clearedState, {
    lastBlocking: false,
    lastValidationCode: null,
    lastIssues: null,
  });
  assert.equal(failureResult.requestFailed, true);
  assert.equal(failureResult.blocking, false);
  assert.equal(
    getCheckoutDisabled({
      isAdding: false,
      isCheckoutLoading: false,
      isUpdating: false,
      isDeleting: false,
      isCartValidating: false,
      isResetting: false,
      lastBlocking: clearedState.lastBlocking,
    }),
    false,
  );
});

test("stock without inStock stays unavailable across client and server purchase checks", () => {
  const inconsistentBook = { inStock: false, stock: 3 };

  assert.equal(isClientBookAvailable(inconsistentBook, 1), false);
  assert.equal(isServerBookAvailable(inconsistentBook, 1), false);
});
