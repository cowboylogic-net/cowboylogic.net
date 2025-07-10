// src/store/thunks/authThunks.js

import axios from "../../store/axios";
import { showNotification } from "../slices/notificationSlice";
import {
  logout,
  loginStart,
  loginSuccess,
  loginFailure,
  fetchStart,
  fetchSuccess,
  fetchFailure,
  updateUserAvatar,
} from "../slices/authSlice"; // ✅ без циклів

// 🔐 Login thunk
export const loginUser = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const res = await axios.post("/auth/verify-code", credentials);
    dispatch(loginSuccess(res.data));
    dispatch(showNotification({ type: "success", message: "Welcome back!" }));
  } catch (err) {
    const msg = err.response?.data?.message || "Login failed";
    dispatch(loginFailure(msg));
    dispatch(showNotification({ type: "error", message: msg }));
  }
};

// 👤 Fetch current user thunk
export const fetchCurrentUser = () => async (dispatch, getState) => {
  const token = getState().auth.token;
  if (!token) {
    dispatch(fetchFailure());
    return;
  }

  dispatch(fetchStart());

  try {
    const res = await axios.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(fetchSuccess(res.data));
  } catch {
    dispatch(fetchFailure());
    dispatch(showNotification({ type: "error", message: "Session expired" }));
  }
};

// 🚪 Logout thunk
export const logoutUser = () => (dispatch) => {
  dispatch(logout());
  dispatch(showNotification({ type: "success", message: "Logged out" }));
};

// 📸 Upload avatar thunk
export const uploadAvatar = (file) => async (dispatch) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await axios.patch("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    dispatch(updateUserAvatar(res.data.avatarURL));
    dispatch(showNotification({ type: "success", message: "Avatar updated" }));
  } catch (err) {
    const msg = err.response?.data?.message || "Upload failed";
    dispatch(showNotification({ type: "error", message: msg }));
  }
};
