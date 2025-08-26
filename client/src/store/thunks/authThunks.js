import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../axios";
import { showNotification } from "../slices/notificationSlice";
import { apiService } from "../../services/axiosService";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/auth/verify-code", credentials);
      localStorage.setItem("token", res.data.data.token);
      dispatch(showNotification({ type: "success", message: "Welcome back!" }));
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
      const res = await api.post("/auth/register", payload);
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
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me"); // ⬅️ правильний шлях
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
      await api.post("/auth/logout");
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

      // ⬇️ ОБЕРИ ваш реальний бекенд-ендпоінт
      const AVATAR_ENDPOINT = "/me/avatar"; // або "/auth/me/avatar"

      const res = await api.patch(AVATAR_ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(
        showNotification({ type: "success", message: "Avatar updated" })
      );
      return res.data.data.avatarURL;
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed";
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const updateMe = createAsyncThunk(
  "auth/updateMe",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiService.patch("/me", payload);
      return res.data.data; // свіжий user
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const upsertPartnerProfile = createAsyncThunk(
  "auth/upsertPartnerProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiService.patch("/me/partner-profile", payload);
      return res.data.data; // свіжий user
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);
