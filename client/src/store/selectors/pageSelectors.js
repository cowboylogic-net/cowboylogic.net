import { createSelector } from "reselect";

// --- Base selectors
const selectPagesState = (state) => state.pages;
const selectPublishedPages = (state) => state.pages.published;
const selectDraftPages = (state) => state.pages.drafts;

// --- Опублікований контент
export const selectPublishedContentBySlug = (slug) =>
  createSelector([selectPublishedPages], (published) => published[slug] || "");

// --- Чернетковий контент
export const selectDraftContentBySlug = (slug) =>
  createSelector([selectDraftPages], (drafts) => drafts[slug] || "");

// --- Статуси
export const selectPageError = createSelector(
  [selectPagesState],
  (pages) => pages.error
);

export const selectPageFetching = createSelector(
  [selectPagesState],
  (pages) => pages.isFetching
);

export const selectPageUpdating = createSelector(
  [selectPagesState],
  (pages) => pages.isUpdating
);

export const selectPageDraftSaving = createSelector(
  [selectPagesState],
  (pages) => pages.isDraftSaving
);

// --- Всі сторінки
export const selectAllPublishedPages = selectPublishedPages;
export const selectAllDraftPages = selectDraftPages;
