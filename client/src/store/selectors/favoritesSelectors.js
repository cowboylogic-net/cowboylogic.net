import { createSelector } from "reselect";

const selectFavoritesState = (state) => state.favorites;

export const selectFavorites = createSelector(
  [selectFavoritesState],
  (fav) => fav.books
);

export const isBookFavorite = (bookId) =>
  createSelector([selectFavorites], (books) =>
    books.some((b) => b.id === bookId)
  );

export const selectFavoritesLoading = createSelector(
  [selectFavoritesState],
  (fav) => fav.isFetching
);

export const selectFavoritesError = createSelector(
  [selectFavoritesState],
  (fav) => fav.error
);
