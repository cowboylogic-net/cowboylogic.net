// src/store/thunks/cartThunks.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axios";
import { showError, showSuccess } from "./notificationThunks";

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch {
      dispatch(showError("Failed to load cart items"));
      return rejectWithValue("Failed to fetch cart");
    }
  }
);

export const addToCartThunk = createAsyncThunk(
  "cart/addToCart",
  async ({ bookId, quantity }, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.post(
        "/cart",
        { bookId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(showSuccess(res.data.message || "Book added to cart!"));

      // 🟡 Обов’язково оновити cart заново
      const fetchResult = await dispatch(fetchCartItems());
      if (fetchResult.meta.requestStatus === "fulfilled") {
        return fetchResult.payload;
      } else {
        return rejectWithValue("Failed to reload cart");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add to cart";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateCartItemQuantity",
  async ({ itemId, quantity }, { getState, dispatch, rejectWithValue }) => {
    if (!itemId) {
      const msg = "Item ID is required";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
    const q = Number(quantity);
    if (!Number.isInteger(q) || q < 1) {
      const msg = "Quantity must be a positive integer";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
    const role = getState().auth.user?.role;
    if (role === "partner" && q < 5) {
      const msg = "Partners must order at least 5 items";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }

    try {
      const token = getState().auth.token;
      await axios.patch(
        `/cart/${itemId}`,
        { quantity: q },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await dispatch(fetchCartItems());
      if (res.meta.requestStatus === "fulfilled") return res.payload;
      return rejectWithValue("Failed to reload cart");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update item";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

export const deleteCartItemThunk = createAsyncThunk(
  "cart/deleteCartItem",
  async (itemId, { getState, dispatch, rejectWithValue }) => {
    if (!itemId) {
      const msg = "Item ID is required";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
    try {
      const token = getState().auth.token;
      await axios.delete(`/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await dispatch(fetchCartItems());
      if (res.meta.requestStatus === "fulfilled") return res.payload;
      return rejectWithValue("Failed to reload cart");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete item";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

export const clearCartThunk = createAsyncThunk(
  "cart/clearCart",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(showSuccess("Cart cleared"));
      const res = await dispatch(fetchCartItems());
      if (res.meta.requestStatus === "fulfilled") return res.payload;
      return rejectWithValue("Failed to reload cart");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to clear cart";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);
