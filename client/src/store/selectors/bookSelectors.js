import { createSelector } from "reselect";

export const selectBookState = (state) => state.books;

export const selectAllBooks = createSelector(
  [selectBookState],
  (bookState) => bookState.books
);

export const selectBookById = (id) =>
  createSelector([selectAllBooks], (books) =>
    books.find((b) => b.id === id)
  );

export const selectLoadingFlags = createSelector(
  [selectBookState],
  (state) => ({
    isFetching: state.isFetching,
    isFetchingById: state.isFetchingById,
    isCreating: state.isCreating,
    isUpdating: state.isUpdating,
    isDeleting: state.isDeleting,
  })
);
