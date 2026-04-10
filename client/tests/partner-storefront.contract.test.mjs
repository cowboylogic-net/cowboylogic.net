import test from "node:test";
import assert from "node:assert/strict";

import axios from "../src/store/axios.js";
import { fetchPartnerBooks } from "../src/store/thunks/bookThunks.js";
import bookReducer from "../src/store/slices/bookSlice.js";

const runThunk = async (thunk, state) => {
  const actions = [];

  const getState = () => state;
  const dispatch = async (action) => {
    if (typeof action === "function") {
      return await action(dispatch, getState, undefined);
    }
    actions.push(action);
    return action;
  };

  const result = await thunk(dispatch, getState, undefined);
  return { result, actions };
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

test("partner books thunk hydrates missing inStock from book details before items reach the storefront slice", async () => {
  const partnerListItem = {
    id: "book-1",
    title: "Partner Book",
    author: "Author",
    description: "Description",
    partnerPrice: "12.50",
    stock: 92,
    imageUrl: "/uploads/book.jpg",
    format: "PAPERBACK",
  };

  const detailBook = {
    ...partnerListItem,
    inStock: true,
  };

  const state = {
    auth: { token: "token", user: { role: "partner" } },
    books: { partnerBooks: [], books: [], selectedBook: null },
  };

  await withPatchedAxios(
    {
      get: async (url) => {
        if (url.startsWith("/books/partner-books?")) {
          return {
            data: {
              data: {
                items: [partnerListItem],
                meta: { page: 1, limit: 12, totalItems: 1, totalPages: 1 },
              },
            },
          };
        }

        if (url === "/books/book-1") {
          return { data: { data: detailBook } };
        }

        throw new Error(`Unexpected GET ${url}`);
      },
    },
    async () => {
      const { result } = await runThunk(fetchPartnerBooks(), state);

      assert.equal(fetchPartnerBooks.fulfilled.match(result), true);
      assert.equal(result.payload.items[0].inStock, true);
      assert.equal(result.payload.items[0].stock, 92);

      const nextState = bookReducer(undefined, result);
      assert.equal(nextState.partnerBooks[0].inStock, true);
      assert.equal(nextState.partnerBooks[0].partnerPrice, "12.50");
    },
  );
});

test("partner books thunk does not re-fetch book details when inStock is already present", async () => {
  const partnerListItem = {
    id: "book-2",
    title: "Partner Book 2",
    author: "Author",
    description: "Description",
    partnerPrice: "15.00",
    stock: 10,
    inStock: false,
    imageUrl: "/uploads/book-2.jpg",
    format: "PAPERBACK",
  };

  const state = {
    auth: { token: "token", user: { role: "partner" } },
    books: { partnerBooks: [], books: [], selectedBook: null },
  };

  const requestedUrls = [];

  await withPatchedAxios(
    {
      get: async (url) => {
        requestedUrls.push(url);
        if (url.startsWith("/books/partner-books?")) {
          return {
            data: {
              data: {
                items: [partnerListItem],
                meta: { page: 1, limit: 12, totalItems: 1, totalPages: 1 },
              },
            },
          };
        }

        throw new Error(`Unexpected GET ${url}`);
      },
    },
    async () => {
      const { result } = await runThunk(fetchPartnerBooks(), state);

      assert.equal(fetchPartnerBooks.fulfilled.match(result), true);
      assert.deepEqual(requestedUrls, [requestedUrls[0]]);
      assert.equal(requestedUrls[0].startsWith("/books/partner-books?"), true);
      assert.equal(result.payload.items[0].inStock, false);
    },
  );
});
