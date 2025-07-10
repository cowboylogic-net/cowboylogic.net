// src/store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    emailForVerification: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    updateUserAvatar: (state, action) => {
      if (state.user) {
        state.user.avatarURL = action.payload;
      }
    },
    setEmailForVerification: (state, action) => {
      state.emailForVerification = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.emailForVerification = null;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem("token");
    },
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoading = false;
      localStorage.setItem("token", action.payload.token);
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchStart: (state) => {
      state.isLoading = true;
    },
    fetchSuccess: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
    },
    fetchFailure: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      localStorage.removeItem("token");
    },
  },
});

export const {
  updateUserAvatar,
  setEmailForVerification,
  logout,
  loginStart,
  loginSuccess,
  loginFailure,
  fetchStart,
  fetchSuccess,
  fetchFailure,
} = authSlice.actions;

export default authSlice.reducer;
