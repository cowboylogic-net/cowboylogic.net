
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../store/axios";
import { showNotification } from "../slices/notificationSlice";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post("/auth/verify-code", credentials);
      localStorage.setItem("token", res.data.data.token);
      dispatch(
        showNotification({ type: "success", message: "Welcome back!" })
      );
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post("/auth/register", payload);
      localStorage.setItem("token", res.data.data.token);
      dispatch(
        showNotification({
          type: "success",
          message: "Registration successful",
        })
      );
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) {
      return rejectWithValue("No token");
    }
    try {
      const res = await axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      localStorage.removeItem("token");
      const msg = err.response?.data?.message || "Session expired";
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);


export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axios.post("/auth/logout");
      localStorage.removeItem("token");
      dispatch(showNotification({ type: "success", message: "Logged out" }));
      return null;
    } catch (err) {
      const msg = err.response?.data?.message || "Logout failed";
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.patch("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(showNotification({ type: "success", message: "Avatar updated" }));
      return res.data.data.avatarURL;
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed";
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);