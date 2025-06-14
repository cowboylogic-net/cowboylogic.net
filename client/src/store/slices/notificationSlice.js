// src/store/slices/notificationSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null,
  type: null, // 'success' | 'error' | 'info' | 'warning'
  isVisible: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.isVisible = true;
    },
    hideNotification: (state) => {
      state.message = null;
      state.type = null;
      state.isVisible = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
