// src/store/thunks/pageThunks.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../store/axios';
import {
  showSuccess,
  showError,
  showTemporaryNotification,
} from './notificationThunks';

// 1. Завантажити опублікований і драфтовий контент
export const fetchPageVersions = createAsyncThunk(
  'pages/fetchPageVersions',
  async (slug, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.get(`/pages/${slug}`);
      return {
        slug,
        published: res.data.content || '',
        draft: res.data.draftContent || res.data.content || '',
      };
    } catch {
      const msg = `Failed to load page: ${slug}`;
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

// 2. Зберегти чернетку (не публікується)
export const saveDraftContent = createAsyncThunk(
  'pages/saveDraftContent',
  async ({ slug, content, token }, { rejectWithValue, dispatch }) => {
    try {
      await axios.put(
        `/pages/${slug}/draft`,
        { draftContent: content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(showTemporaryNotification({ type: 'info', message: `Draft saved for ${slug}` }));
      return { slug, content };
    } catch {
      const msg = `Failed to save draft for ${slug}`;
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

// 3. Зберегти і опублікувати сторінку
export const updatePageContent = createAsyncThunk(
  'pages/updatePageContent',
  async ({ slug, content, token }, { rejectWithValue, dispatch }) => {
    try {
      await axios.put(
        `/pages/${slug}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(showSuccess(`Changes published for ${slug}`));
      return { slug, content };
    } catch {
      const msg = `Failed to publish page: ${slug}`;
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);
