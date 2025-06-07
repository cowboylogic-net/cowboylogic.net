import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../store/axios";
import { showNotification } from "../slices/notificationSlice";

export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/books");
      return response.data;
    } catch {
      return rejectWithValue("Failed to load books");
    }
  }
);

export const fetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/books/${id}`);
      return response.data;
    } catch {
      return rejectWithValue("Failed to fetch book by ID");
    }
  }
);

export const createBook = createAsyncThunk(
  "books/createBook",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post("/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(showNotification({ type: "success", message: "Book added successfully!" }));
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create book";
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const updateBook = createAsyncThunk(
  "books/updateBook",
  async ({ id, formData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(`/books/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(showNotification({ type: "success", message: "Book updated successfully!" }));
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update book";
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteBook = createAsyncThunk(
  "books/deleteBook",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/books/${id}`);
      dispatch(showNotification({ type: "success", message: "Book deleted successfully!" }));
      return id;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete book";
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);
