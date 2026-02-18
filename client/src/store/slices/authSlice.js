import { createSlice } from "@reduxjs/toolkit";
import { toAbsoluteMediaUrl } from "../../utils/mediaUrl";

import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  logoutUser,
  uploadAvatar,
  updateMe,
  upsertPartnerProfile,
  refreshSession,
  bootstrapAuth,
} from "../thunks/authThunks";

const initialState = {
  user: null,
  token: null,
  emailForVerification: null,
  isLoading: false,
  bootstrapStatus: "idle",
  sessionExpiredNonce: 0,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionExpired: (state) => {
    state.user = null;
    state.token = null;
    state.emailForVerification = null;
    state.isLoading = false;
    state.bootstrapStatus = "done";
    state.error = null;
    state.sessionExpiredNonce = (state.sessionExpiredNonce || 0) + 1;
  },
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = {
        ...action.payload.user,
        avatarURL: toAbsoluteMediaUrl(action.payload.user?.avatarURL),
      };
      state.isLoading = false;
      state.bootstrapStatus = "done";
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.emailForVerification = null;
      state.isLoading = false;
      state.bootstrapStatus = "done";
      state.error = null;
    },
    updateUserAvatar: (state, action) => {
      if (state.user) {
        state.user.avatarURL = toAbsoluteMediaUrl(action.payload);
      }
    },
    setEmailForVerification: (state, action) => {
      state.emailForVerification = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.token = action.payload;
      })
      .addCase(bootstrapAuth.pending, (state) => {
        if (state.bootstrapStatus === "idle") {
          state.bootstrapStatus = "loading";
        }
      })
      .addCase(bootstrapAuth.fulfilled, (state) => {
        state.bootstrapStatus = "done";
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.bootstrapStatus = "done";
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = {
          ...action.payload.user,
          avatarURL: toAbsoluteMediaUrl(action.payload.user?.avatarURL),
        };
        state.isLoading = false;
        state.bootstrapStatus = "done";
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
        state.user = {
          ...action.payload.user,
          avatarURL: toAbsoluteMediaUrl(action.payload.user?.avatarURL),
        };
        state.isLoading = false;
        state.bootstrapStatus = "done";
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
        state.user = {
          ...action.payload,
          avatarURL: toAbsoluteMediaUrl(action.payload?.avatarURL),
        };
        state.isLoading = false;
        state.bootstrapStatus = "done";
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        const silent = Boolean(action.meta?.arg?.silent);

        state.isLoading = false;
        state.bootstrapStatus = "done";
        state.error = action.payload;

        if (!silent) {
          state.user = null;
          state.token = null;
        }
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.emailForVerification = null;
        state.isLoading = false;
        state.bootstrapStatus = "done";
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.avatarURL = toAbsoluteMediaUrl(action.payload);
        }
      })
      .addCase(updateMe.fulfilled, (state, action) => {
        state.user = {
          ...action.payload,
          avatarURL: toAbsoluteMediaUrl(action.payload?.avatarURL),
        };
      })
      .addCase(upsertPartnerProfile.fulfilled, (state, action) => {
        state.user = {
          ...action.payload,
          avatarURL: toAbsoluteMediaUrl(action.payload?.avatarURL),
        };
      });
  },
});

export const {
  loginSuccess,
  logout,
  updateUserAvatar,
  setEmailForVerification,
} = authSlice.actions;

export default authSlice.reducer;
