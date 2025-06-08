// === pageSlice.js ===
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPageVersions,
  updatePageContent,
  saveDraftContent,
} from "../thunks/pageThunks";

const pageSlice = createSlice({
  name: "pages",
  initialState: {
    published: {},     // 💾 збережений (live) контент
    drafts: {},        // ✍️ чернетка (draft)
    isFetching: false,
    isUpdating: false,
    isDraftSaving: false,
    error: null,
  },
  reducers: {
    setDraftManually: (state, action) => {
      const { slug, content } = action.payload;
      state.drafts[slug] = content;
    },
    clearDraft: (state, action) => {
      delete state.drafts[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Завантаження
      .addCase(fetchPageVersions.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchPageVersions.fulfilled, (state, action) => {
        const { slug, published, draft } = action.payload;
        state.published[slug] = published;
        state.drafts[slug] = draft;
        state.isFetching = false;
      })
      .addCase(fetchPageVersions.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })

      // 2. Збереження чернетки
      .addCase(saveDraftContent.pending, (state) => {
        state.isDraftSaving = true;
        state.error = null;
      })
      .addCase(saveDraftContent.fulfilled, (state, action) => {
        const { slug, content } = action.payload;
        state.drafts[slug] = content;
        state.isDraftSaving = false;
      })
      .addCase(saveDraftContent.rejected, (state, action) => {
        state.isDraftSaving = false;
        state.error = action.payload;
      })

      // 3. Публікація
      .addCase(updatePageContent.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePageContent.fulfilled, (state, action) => {
        const { slug, content } = action.payload;
        state.published[slug] = content;
        state.drafts[slug] = content; // синхронізуємо з live
        state.isUpdating = false;
      })
      .addCase(updatePageContent.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const { setDraftManually, clearDraft } = pageSlice.actions;
export default pageSlice.reducer;
