import { createSlice } from "@reduxjs/toolkit";

import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  logoutUser,
  uploadAvatar,
  updateMe,
  upsertPartnerProfile,
  refreshSession
} from "../thunks/authThunks";

const initialState = {
  user: null,
  token: null,
  emailForVerification: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
    state.token = action.payload.token;
    state.user = action.payload.user;
    state.isLoading = false;
    state.error = null;
  },
  logout: (state) => {
    state.user = null;
    state.token = null;
    state.emailForVerification = null;
    state.isLoading = false;
    state.error = null;
  },
    updateUserAvatar: (state, action) => {
      if (state.user) {
        state.user.avatarURL = action.payload;
      }
    },
    setEmailForVerification: (state, action) => {
      state.emailForVerification = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(refreshSession.fulfilled, (state, action) => {
        state.token = action.payload; // лише access token
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.emailForVerification = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.avatarURL = action.payload;
        }
      })
       .addCase(updateMe.fulfilled, (state, action) => {
    state.user = action.payload;
  })
  .addCase(upsertPartnerProfile.fulfilled, (state, action) => {
    state.user = action.payload;
  });
  },
});

export const { loginSuccess, logout, updateUserAvatar, setEmailForVerification } = authSlice.actions;

export default authSlice.reducer;
