import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';
import { showNotification } from './notificationSlice';

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

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        localStorage.removeItem('token');
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
