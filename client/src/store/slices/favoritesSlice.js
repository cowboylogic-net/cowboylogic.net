// src/store/slices/favoritesSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
} from "../thunks/favoritesThunks";

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    books: [], // завжди масив повних Book
    error: null,
    isFetching: false,
    isAdding: false,
    isRemoving: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchFavorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.books = action.payload;
        state.isFetching = false;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.error = action.payload;
        state.isFetching = false;
      })

      // addFavorite -> повертаємо повний масив після рефетчу
      .addCase(addFavorite.pending, (state) => {
        state.isAdding = true;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.books = action.payload; // ⬅️ тепер тут повні Book[]
        state.isAdding = false;
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.error = action.payload;
        state.isAdding = false;
      })

      // removeFavorite -> повертаємо повний масив після рефетчу
      .addCase(removeFavorite.pending, (state) => {
        state.isRemoving = true;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.books = action.payload; // ⬅️ повні Book[] після рефетчу
        state.isRemoving = false;
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.error = action.payload;
        state.isRemoving = false;
      });
  },
});

export default favoritesSlice.reducer;
