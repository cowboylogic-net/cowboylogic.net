import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axios";
import { showNotification } from "../slices/notificationSlice";

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue, getState }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("No auth token provided");

    try {
      const res = await axios.get("/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load favorites"
      );
    }
  }
);

export const addFavorite = createAsyncThunk(
  "favorites/addFavorite",
  async (bookId, { rejectWithValue, dispatch, getState }) => {
    try {
      const token = getState().auth.token;

      await axios.post(
        "/favorites",
        { bookId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(
        showNotification({ type: "success", message: "Added to favorites" })
      );

      // 🔁 Повертаємо лише bookId — завжди надійно
      return bookId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Add failed");
    }
  }
);
export const removeFavorite = createAsyncThunk(
  "favorites/removeFavorite",
  async (bookId, { rejectWithValue, dispatch, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`/favorites/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(
        showNotification({
          type: "success",
          message: "Removed from favorites",
        })
      );
      return bookId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Remove failed");
    }
  }
);
