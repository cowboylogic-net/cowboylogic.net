// src/store/slices/authSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { loginUser, fetchCurrentUser, logoutUser } from "../thunks/authThunks";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    updateUserAvatar: (state, action) => {
      if (state.user) {
        state.user.avatarURL = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔐 loginUser
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user; // ✅ Додай це!
        localStorage.setItem("token", action.payload.token);
        state.isLoading = false;
        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ fetchCurrentUser
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
        localStorage.removeItem("token");
      })

      // 🚪 logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        localStorage.removeItem("token");
      });
  },
});

export const { logout, updateUserAvatar } = authSlice.actions;
export default authSlice.reducer;
