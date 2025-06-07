import { createSelector } from "reselect";

const selectPages = (state) => state.pages.pages;

export const selectPageContentBySlug = (slug) =>
  createSelector([selectPages], (pages) => pages[slug] || "");
export const selectPageError = (state) => state.pages.error;
export const selectPageFetching = (state) => state.pages.isFetching;
export const selectPageUpdating = (state) => state.pages.isUpdating;
export const selectAllPages = (state) => state.pages.pages;

