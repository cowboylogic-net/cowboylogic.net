import { createSlice } from "@reduxjs/toolkit";
import { fetchOrders, deleteOrder } from "../thunks/ordersThunks";
import { logout } from "./authSlice";

const initialState = {
  orders: [],
  loading: false,
  error: null,
  lastFetched: null, // 🕓 додано
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
        state.lastFetched = Date.now(); // 🕓 оновлюємо timestamp
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((order) => order.id !== action.payload);
      })
      .addCase(logout, (state) => {
        state.orders = [];
        state.loading = false;
        state.error = null;
        state.lastFetched = null; // 🧹 очищення
      });
  },
});

export default ordersSlice.reducer;
