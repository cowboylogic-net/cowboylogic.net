// src/store/thunks/ordersThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axios";
import { showError, showSuccess } from "./notificationThunks";

/**
 * GET /orders — ордери поточного користувача
 */
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load orders";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

/**
 * GET /orders/all — усі ордери (admin/superAdmin)
 */
export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAllOrders",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get("/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load all orders";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

/**
 * GET /orders/latest — останній ордер користувача
 */
export const fetchLatestOrder = createAsyncThunk(
  "orders/fetchLatestOrder",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get("/orders/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load latest order";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

/**
 * POST /orders — створити ордер з кошика (user)
 * Після створення робимо рефетч списку ордерів користувача.
 */
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;

      // не зберігаємо res — просто викликаємо і чекаємо
      await axios.post(
        "/orders",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch(showSuccess("Order placed"));

      // refetch, щоб повернути оновлений список
      const ref = await dispatch(fetchOrders());
      if (ref.meta.requestStatus === "fulfilled") return ref.payload;
      return rejectWithValue("Failed to reload orders");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create order";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);


/**
 * POST /orders/confirm — підтвердження після Square (user)
 * Після підтвердження робимо рефетч списку ордерів користувача.
 */
export const confirmSquareOrder = createAsyncThunk(
  "orders/confirmSquareOrder",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.post(
        "/orders/confirm",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(showSuccess(res?.data?.message || "Order confirmed"));
      // refetch
      const ref = await dispatch(fetchOrders());
      if (ref.meta.requestStatus === "fulfilled") return ref.payload;
      return rejectWithValue("Failed to reload orders");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to confirm order";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

/**
 * PATCH /orders/:id/status — оновити статус (admin/superAdmin)
 * Повертаємо оновлений ордер, щоб оновити його локально без повного рефетчу.
 */
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.patch(
        `/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(showSuccess("Order status updated"));
      return res.data.data; // оновлений Order
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update status";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);

/**
 * DELETE /orders/:id — видалити ордер (admin/superAdmin)
 */
export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(showSuccess("Order deleted"));
      return orderId;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete order";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);
