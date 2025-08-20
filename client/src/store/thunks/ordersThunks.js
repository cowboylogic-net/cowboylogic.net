import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axios";
import { showError, showSuccess } from "./notificationThunks";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get("/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load orders";
      dispatch(showError(msg));
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
      dispatch(showSuccess("Order deleted successfully"));
      return orderId;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete order";
      dispatch(showError(msg));
      return rejectWithValue(msg);
    }
  }
);
