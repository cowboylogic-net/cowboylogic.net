import { createSlice } from "@reduxjs/toolkit";
import { fetchPageContent, updatePageContent } from "../thunks/pageThunks";

const pageSlice = createSlice({
  name: "pages",
  initialState: {
    pages: {},
    error: null,
    isFetching: false,
    isUpdating: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPageContent.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchPageContent.fulfilled, (state, action) => {
        state.pages[action.payload.slug] = action.payload.content;
        state.isFetching = false;
      })
      .addCase(fetchPageContent.rejected, (state, action) => {
        state.error = action.payload;
        state.isFetching = false;
      })

      .addCase(updatePageContent.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePageContent.fulfilled, (state, action) => {
        state.pages[action.payload.slug] = action.payload.content;
        state.isUpdating = false;
      })
      .addCase(updatePageContent.rejected, (state, action) => {
        state.error = action.payload;
        state.isUpdating = false;
      });
  },
});

export default pageSlice.reducer;
