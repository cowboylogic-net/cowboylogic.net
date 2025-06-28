import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
} from "../thunks/favoritesThunks";

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    books: [],
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

      // addFavorite
      .addCase(addFavorite.pending, (state) => {
        state.isAdding = true;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        const exists = state.books.find(
          (b) => String(b.id) === String(action.payload)
        );
        if (!exists) {
          state.books.push({ id: action.payload }); // ✅ лише ID, бо немає інших полів
        }
        state.isAdding = false;
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.error = action.payload;
        state.isAdding = false;
      })

      // removeFavorite
      .addCase(removeFavorite.pending, (state) => {
        state.isRemoving = true;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.books = state.books.filter((b) => b.id !== action.payload);
        state.isRemoving = false;
      })

      .addCase(removeFavorite.rejected, (state, action) => {
        state.error = action.payload;
        state.isRemoving = false;
      });
  },
});

export default favoritesSlice.reducer;
