import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../store/axios.js";
import { showSuccess, showError } from "./notificationThunks.js";

const hasExplicitAvailability = (book) => typeof book?.inStock === "boolean";

const hydratePartnerBookAvailability = async (book, headers) => {
  if (!book?.id || hasExplicitAvailability(book)) return book;

  const response = await axios.get(`/books/${book.id}`, { headers });
  const detailedBook = response?.data?.data;

  if (!detailedBook) return book;

  return {
    ...book,
    inStock: detailedBook.inStock,
    stock: detailedBook.stock ?? book.stock,
  };
};

// 📚 Отримати всі книги
export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (params = {}, { rejectWithValue, dispatch, getState }) => {
    try {
      const { token } = getState().auth;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const page = params.page ?? 1;
      const limit = params.limit ?? 12;
      const sortBy = params.sortBy ?? "createdAt";
      const order = params.order ?? "desc";

      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        order,
      }).toString();

      const response = await axios.get(`/books?${qs}`, { headers });
      // { data: { items, meta } }
      return response.data.data;
    } catch (err) {
      const msg = "Failed to fetch books";
      dispatch(showError(err, msg));
      return rejectWithValue(msg);
    }
  }
);

// 🔍 Отримати книгу за ID
export const fetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (id, { rejectWithValue, dispatch, getState }) => {
    // const { token } = getState().auth;
    try {
      const { token } = getState().auth;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await axios.get(`/books/${id}`, { headers });

      return response.data.data;
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
      dispatch(
        showSuccess(response.data.message || "Book added successfully!")
      );
      return response.data.data;
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
      dispatch(
        showSuccess(response.data.message || "Book updated successfully!")
      );
      return response.data.data;
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
      const response = await axios.delete(`/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(
        showSuccess(response.data.message || "Book deleted successfully!")
      );
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
  async (params = {}, { rejectWithValue, getState, dispatch }) => {
    try {
      const { token } = getState().auth;
      const headers = { Authorization: `Bearer ${token}` };

      const page = params.page ?? 1;
      const limit = params.limit ?? 12;
      const sortBy = params.sortBy ?? "createdAt";
      const order = params.order ?? "desc";

      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        order,
      }).toString();

      const response = await axios.get(`/books/partner-books?${qs}`, {
        headers,
      });
      const partnerData = response.data.data;
      const items = Array.isArray(partnerData?.items) ? partnerData.items : [];

      if (items.every(hasExplicitAvailability)) {
        return partnerData; // { items, meta }
      }

      const hydratedItems = await Promise.all(
        items.map((book) => hydratePartnerBookAvailability(book, headers)),
      );

      return {
        ...partnerData,
        items: hydratedItems,
      };
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to load partner books";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

export const checkStock = createAsyncThunk(
  "books/checkStock",
  async (items, { getState, dispatch, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await axios.post(
        "/books/check-stock",
        { items }, // [{ bookId, quantity }]
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { ...res.data.data, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Stock check failed";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);
