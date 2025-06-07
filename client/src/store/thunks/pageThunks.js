// === pageThunks.js ===
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../store/axios";
import { showNotification } from "../slices/notificationSlice";

export const fetchPageContent = createAsyncThunk(
  "pages/fetchPageContent",
  async (slug, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.get(`/pages/${slug}`);
      return { slug, content: res.data.content };
    } catch {
      const msg = `Failed to load page: ${slug}`;
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const updatePageContent = createAsyncThunk(
  "pages/updatePageContent",
  async ({ slug, content, token }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.put(
        `/pages/${slug}`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(
        showNotification({
          type: "success",
          message: `Saved changes for ${slug}`,
        })
      );
      return { slug, content: res.data.content };
    } catch {
      const msg = `Failed to update page: ${slug}`;
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);
