import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../axios";

import {
  showSuccess,
  showError,
  showTemporaryNotification,
} from "./notificationThunks";

// 1. Завантажити опублікований і драфтовий контент
export const fetchPageVersions = createAsyncThunk(
  "pages/fetchPageVersions",
  async (slug, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.get(`/pages/${slug}`, { headers: { "Cache-Control": "no-store" } });

      const payload = (res?.data && (res.data.data ?? res.data)) || null;
      if (!payload || typeof payload !== "object")
        throw new Error("Empty or malformed payload");
      return {
        slug,
        published: payload.content || "",
        draft: payload.draftContent ?? payload.content ?? "",
      };
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to load page: ${slug}`;
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

// 2. Зберегти чернетку (не публікується)
export const saveDraftContent = createAsyncThunk(
  "pages/saveDraftContent",
  async ({ slug, content }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/pages/${slug}/draft`, { draftContent: content });

      dispatch(
        showTemporaryNotification({
          type: "info",
          message: `Draft saved for ${slug}`,
        })
      );
      return { slug, content };
    } catch (err) {
      const msg =
        err.response?.data?.message || `Failed to save draft for ${slug}`;
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

export const updatePageContent = createAsyncThunk(
  "pages/updatePageContent",
  async ({ slug, content }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/pages/${slug}`, { content });

      dispatch(showSuccess(`Changes published for ${slug}`));
      return { slug, content };
    } catch (err) {
      const msg =
        err.response?.data?.message || `Failed to publish page: ${slug}`;
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);
