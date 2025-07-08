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

  export const selectSelectedBook = createSelector(
  [selectBookState],
  (state) => state.selectedBook
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
export const selectPartnerBooks = (state) => state.books.partnerBooks;
export const selectBooksError = (state) => state.books.error;
export const selectIsFetchingPartnerBooks = (state) =>
  state.books.isFetchingPartnerBooks;


