import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBooks,
  fetchBookById,
  createBook,
  updateBook,
  deleteBook,
  checkStock,
  fetchPartnerBooks,
} from "../thunks/bookThunks";

// slices/bookSlice.js
const initialState = {
  books: [],
  partnerBooks: [],
  partnerPagination: {
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
    sortBy: "createdAt",
    order: "desc",
  },
  selectedBook: null,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
    sortBy: "createdAt",
    order: "desc",
  },

  isFetching: false,
  isFetchingById: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isFetchingPartnerBooks: false,
  isCheckingStock: false,
  stockCheckResult: null,
};

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    setSelectedBook: (state, action) => {
      state.selectedBook = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // auth/logout
      .addCase("auth/logout", (state) => {
        state.books = [];
        state.partnerBooks = [];
        state.selectedBook = null;
        state.error = null;
        state.isFetching = false;
        state.isFetchingById = false;
        state.isCreating = false;
        state.isUpdating = false;
        state.isDeleting = false;
        state.isFetchingPartnerBooks = false;
        state.isCheckingStock = false;
        state.stockCheckResult = null;
        state.pagination = {
          page: 1,
          limit: 12,
          totalItems: 0,
          totalPages: 1,
          hasPrev: false,
          hasNext: false,
          sortBy: "createdAt",
          order: "desc",
        };
        state.partnerPagination = {
          page: 1,
          limit: 12,
          totalItems: 0,
          totalPages: 1,
          hasPrev: false,
          hasNext: false,
          sortBy: "createdAt",
          order: "desc",
        };
      })

      // ✅ ЄДИНИЙ блок для fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        const { items, meta } = action.payload;
        state.books = items;
        state.pagination = meta;
        state.isFetching = false;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload || "Failed to fetch books";
      })

      // checkStock
      .addCase(checkStock.pending, (state) => {
        state.isCheckingStock = true;
        state.stockCheckResult = null;
        state.error = null;
      })
      .addCase(checkStock.fulfilled, (state, action) => {
        state.isCheckingStock = false;
        state.stockCheckResult = Boolean(action.payload?.success);
      })
      .addCase(checkStock.rejected, (state, action) => {
        state.isCheckingStock = false;
        state.stockCheckResult = false;
        state.error = action.payload;
      })

      // fetchBookById
      .addCase(fetchBookById.pending, (state) => {
        state.isFetchingById = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.selectedBook = action.payload;
        state.isFetchingById = false;

        // Опціонально: не додавати в список сторінки, щоб не «засмічувати» пагінований список
        const exists = state.books.find((b) => b.id === action.payload.id);
        if (!exists) {
          state.books.push(action.payload);
        }
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.error = action.payload;
        state.isFetchingById = false;
      })

      // createBook
      .addCase(createBook.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.books.push(action.payload);
        state.isCreating = false;
      })
      .addCase(createBook.rejected, (state, action) => {
        state.error = action.payload;
        state.isCreating = false;
      })

      // updateBook
      .addCase(updateBook.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const index = state.books.findIndex(
          (book) => book.id === action.payload.id
        );
        if (index !== -1) state.books[index] = action.payload;

        if (state.selectedBook?.id === action.payload.id) {
          state.selectedBook = action.payload;
        }

        state.isUpdating = false;
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.error = action.payload;
        state.isUpdating = false;
      })

      // deleteBook
      .addCase(deleteBook.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter((book) => book.id !== action.payload);
        if (state.selectedBook?.id === action.payload) {
          state.selectedBook = null;
        }
        state.isDeleting = false;
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.error = action.payload;
        state.isDeleting = false;
      })

      // fetchPartnerBooks
      .addCase(fetchPartnerBooks.pending, (state) => {
        state.isFetchingPartnerBooks = true;
        state.error = null;
      })
      .addCase(fetchPartnerBooks.fulfilled, (state, action) => {
        const { items, meta } = action.payload;
        state.partnerBooks = items;
        state.partnerPagination = meta;
        state.isFetchingPartnerBooks = false;
      })
      .addCase(fetchPartnerBooks.rejected, (state, action) => {
        state.error = action.payload;
        state.isFetchingPartnerBooks = false;
      });
  },
});

export const { setSelectedBook } = bookSlice.actions;
export default bookSlice.reducer;
