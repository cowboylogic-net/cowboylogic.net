// src/store/thunks/bookThunks.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../store/axios";
import { showSuccess, showError } from "./notificationThunks";

// 📚 Отримати всі книги
export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (_, { rejectWithValue, dispatch, getState }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.get("/books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch {
      const msg = "Failed to load books";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

// 🔍 Отримати книгу за ID
export const fetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (id, { rejectWithValue, dispatch, getState }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.get(`/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch {
      const msg = "Failed to fetch book by ID";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);


// ➕ Створити нову книгу
export const createBook = createAsyncThunk(
  "books/createBook",
  async (formData, { rejectWithValue, dispatch, getState }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.post("/books", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch(showSuccess("Book added successfully!"));
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create book";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

// ✏️ Оновити існуючу книгу
export const updateBook = createAsyncThunk(
  "books/updateBook",
  async ({ id, formData }, { rejectWithValue, dispatch, getState }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.put(`/books/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch(showSuccess("Book updated successfully!"));
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update book";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

// 🗑️ Видалити книгу
export const deleteBook = createAsyncThunk(
  "books/deleteBook",
  async (id, { rejectWithValue, dispatch, getState }) => {
    const { token } = getState().auth;
    try {
      await axios.delete(`/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(showSuccess("Book deleted successfully!"));
      return id;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete book";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

export const fetchPartnerBooks = createAsyncThunk(
  "books/fetchPartnerBooks",

  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get("/books/partner-books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
  
);
