// cartThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';
import { showNotification } from '../slices/notificationSlice';

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
      dispatch(showNotification({ type: 'error', message: 'Failed to load cart items' }));
      return rejectWithValue('Failed to fetch cart');
    }
  }
);

export const addToCartThunk = createAsyncThunk(
  'cart/addToCart',
  async ({ bookId, quantity }, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(
        '/cart',
        { bookId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(showNotification({ type: 'success', message: 'Book added to cart!' }));
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add to cart';
      dispatch(showNotification({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);



