// src/store/thunks/cartThunks.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';
import { showError, showSuccess } from './notificationThunks';

export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch {
      dispatch(showError('Failed to load cart items'));
      return rejectWithValue('Failed to fetch cart');
    }
  }
);

export const addToCartThunk = createAsyncThunk(
  'cart/addToCart',
  async ({ bookId, quantity }, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = getState().auth.token;

      await axios.post(
        '/cart',
        { bookId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch(showSuccess('Book added to cart!'));

      // 🟡 Обов’язково оновити cart заново
      const fetchResult = await dispatch(fetchCartItems());
      if (fetchResult.meta.requestStatus === 'fulfilled') {
        return fetchResult.payload;
      } else {
        return rejectWithValue('Failed to reload cart');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add to cart';
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

