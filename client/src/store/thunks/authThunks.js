// src/store/thunks/authThunks.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../store/axios';
import { logout } from '../slices/authSlice';
import { showNotification } from '../slices/notificationSlice';

// 🔐 Login: email + code → JWT
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, code }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post('/auth/verify-code', { email, code });
      dispatch(showNotification({ type: 'success', message: 'Welcome back!' }));
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch(showNotification({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

// ✅ Перевірка JWT → отримати поточного користувача
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (token, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch {
      dispatch(showNotification({ type: 'error', message: 'Session expired' }));
      return rejectWithValue('Token invalid or expired');
    }
  }
);

// 🚪 Logout thunk → очищення Redux і localStorage
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(logout());
      dispatch(showNotification({ type: 'success', message: 'Logged out' }));
    } catch (err) {
      const msg = err.message || 'Logout failed';
      dispatch(showNotification({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);
