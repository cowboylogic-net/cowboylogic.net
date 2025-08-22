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
  selectedBook: null,
  error: null,

  isFetching: false,
  isFetchingById: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isFetchingPartnerBooks: false, // якщо ще не додавала — додай
  isCheckingStock: false, // ← для чек-стоку
  stockCheckResult: null, // ← true/false/null
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
      // fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.books = action.payload;
        state.isFetching = false;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.error = action.payload;
        state.isFetching = false;
      })

      // slices/bookSlice.js (всередині builder)
      .addCase(checkStock.pending, (state) => {
        state.isCheckingStock = true;
        state.stockCheckResult = null;
        state.error = null;
      })
      .addCase(checkStock.fulfilled, (state, action) => {
        // санка повертає res.data.data -> { success: true/false }
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

        // 🧠 Додаємо в books[], якщо її ще немає
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
        state.partnerBooks = action.payload;
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
