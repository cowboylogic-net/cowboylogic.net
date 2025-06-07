import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axios";
import { showNotification } from "../slices/notificationSlice";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load orders";
      return rejectWithValue(msg);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId, { rejectWithValue, dispatch, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(showNotification({ type: "success", message: "Order deleted successfully" }));
      return orderId;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete order";
      dispatch(showNotification({ type: "error", message: msg }));
      return rejectWithValue(msg);
    }
  }
);
