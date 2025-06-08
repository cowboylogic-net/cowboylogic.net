// === pageThunks.js ===
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../store/axios";
import { showNotification } from "../slices/notificationSlice";

// 1. Завантажити обидві версії контенту
export const fetchPageVersions = createAsyncThunk(
  "pages/fetchPageVersions",
  async (slug, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.get(`/pages/${slug}`);
      return {
        slug,
        published: res.data.content || "",
        draft: res.data.draftContent || res.data.content || "",
      };
    } catch {
      const msg = `Failed to load page: ${slug}`;
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);

// 2. Зберегти лише чернетку
export const saveDraftContent = createAsyncThunk(
  "pages/saveDraftContent",
  async ({ slug, content, token }, { rejectWithValue, dispatch }) => {
    try {
      await axios.put(
        `/pages/${slug}/draft`,
        { draftContent: content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(showNotification({ type: "info", message: `Draft saved for ${slug}` }));
      return { slug, content };
    } catch {
      const msg = `Failed to save draft for ${slug}`;
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);

// 3. Оновити (опублікувати) контент
export const updatePageContent = createAsyncThunk(
  "pages/updatePageContent",
  async ({ slug, content, token }, { rejectWithValue, dispatch }) => {
    try {
      await axios.put(
        `/pages/${slug}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(showNotification({ type: "success", message: `Changes published for ${slug}` }));
      return { slug, content };
    } catch {
      const msg = `Failed to publish page: ${slug}`;
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);
