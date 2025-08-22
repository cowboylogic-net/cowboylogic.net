// === pageSlice.js ===
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPageVersions,
  updatePageContent,
  saveDraftContent,
} from "../thunks/pageThunks";

// pageSlice.js
const pageSlice = createSlice({
  name: "pages",
  initialState: {
    published: {},
    drafts: {},
    isFetching: false,
    isDraftSaving: false,
    isUpdating: false,
    errors: { fetch: null, draft: null, publish: null }, // ⬅️
  },
  reducers: {
    setDraftManually: (state, { payload }) => {
      const { slug, content } = payload;
      state.drafts[slug] = content;
    },
    clearDraft: (state, { payload: slug }) => {
      delete state.drafts[slug];
    },
    resetPagesState: () => ({
      published: {},
      drafts: {},
      isFetching: false,
      isDraftSaving: false,
      isUpdating: false,
      errors: { fetch: null, draft: null, publish: null },
    }),
  },
  extraReducers: (b) => {
    b // fetch
      .addCase(fetchPageVersions.pending, (s) => { s.isFetching = true; s.errors.fetch = null; })
      .addCase(fetchPageVersions.fulfilled, (s, a) => {
        const { slug, published, draft } = a.payload;
        s.published[slug] = published;
        s.drafts[slug] = draft;
        s.isFetching = false;
      })
      .addCase(fetchPageVersions.rejected, (s, a) => { s.isFetching = false; s.errors.fetch = a.payload; })

      // draft
      .addCase(saveDraftContent.pending,   (s) => { s.isDraftSaving = true; s.errors.draft = null; })
      .addCase(saveDraftContent.fulfilled, (s, a) => {
        const { slug, content } = a.payload;
        s.drafts[slug] = content;
        s.isDraftSaving = false;
      })
      .addCase(saveDraftContent.rejected,  (s, a) => { s.isDraftSaving = false; s.errors.draft = a.payload; })

      // publish
      .addCase(updatePageContent.pending,   (s) => { s.isUpdating = true; s.errors.publish = null; })
      .addCase(updatePageContent.fulfilled, (s, a) => {
        const { slug, content } = a.payload;
        s.published[slug] = content;
        s.drafts[slug] = content; // sync
        s.isUpdating = false;
      })
      .addCase(updatePageContent.rejected,  (s, a) => { s.isUpdating = false; s.errors.publish = a.payload; })

      // опціонально: при logout
      .addMatcher((act) => act?.type === "auth/logout", (s) => {
        s.published = {}; s.drafts = {};
        s.isFetching = s.isDraftSaving = s.isUpdating = false;
        s.errors = { fetch: null, draft: null, publish: null };
      });
  },
});

export const { setDraftManually, clearDraft, resetPagesState } = pageSlice.actions;
export default pageSlice.reducer;
