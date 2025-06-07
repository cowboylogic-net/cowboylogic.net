import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBooks,
  fetchBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../thunks/bookThunks";

const initialState = {
  books: [],
  selectedBook: null,
  error: null,

  isFetching: false,
  isFetchingById: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
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

      // fetchBookById
      .addCase(fetchBookById.pending, (state) => {
        state.isFetchingById = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.selectedBook = action.payload;
        state.isFetchingById = false;
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
        const index = state.books.findIndex((book) => book.id === action.payload.id);
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
      });
  },
});

export const { setSelectedBook } = bookSlice.actions;
export default bookSlice.reducer;
