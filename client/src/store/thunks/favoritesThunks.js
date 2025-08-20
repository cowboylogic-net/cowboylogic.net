// src/store/thunks/favoritesThunks.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';
import { showSuccess, showError } from './notificationThunks';

export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue, getState, dispatch }) => {
    const token = getState().auth.token;
    if (!token) {
      dispatch(showError('No auth token provided'));
      return rejectWithValue('No auth token');
    }

    try {
      const res = await axios.get('/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load favorites';
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async (bookId, { rejectWithValue, dispatch, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.post(
        '/favorites',
        { bookId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(showSuccess('Added to favorites'));
      return bookId;
    } catch (err) {
      const msg = err.response?.data?.message || 'Add to favorites failed';
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (bookId, { rejectWithValue, dispatch, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`/favorites/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(showSuccess('Removed from favorites'));
      return bookId;
    } catch (err) {
      const msg = err.response?.data?.message || 'Remove from favorites failed';
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);
