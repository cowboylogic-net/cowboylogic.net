// src/store/slices/ordersSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchOrders,
  fetchAllOrders,
  fetchLatestOrder,
  createOrder,
  confirmSquareOrder,
  updateOrderStatus,
  deleteOrder,
} from "../thunks/ordersThunks";

const initialState = {
  orders: [],         // список для поточного екрана (user або admin)
  latest: null,       // останній ордер поточного юзера
  loading: false,
  error: null,
  isCreating: false,
  isConfirming: false,
  isUpdatingStatus: false,
  isDeleting: false,
  lastFetched: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // на випадок ручного ресету
    resetOrdersState: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      // ───────── fetchOrders (user) ─────────
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ───────── fetchAllOrders (admin) ─────────
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ───────── fetchLatestOrder (user) ─────────
      .addCase(fetchLatestOrder.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchLatestOrder.fulfilled, (state, action) => {
        state.latest = action.payload;
      })
      .addCase(fetchLatestOrder.rejected, (state, action) => {
        state.latest = null;
        state.error = action.payload;
      })

      // ───────── createOrder (user) ─────────
      .addCase(createOrder.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders = action.payload;   // після рефетчу
        state.isCreating = false;
        state.lastFetched = Date.now();
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // ───────── confirmSquareOrder (user) ─────────
      .addCase(confirmSquareOrder.pending, (state) => {
        state.isConfirming = true;
        state.error = null;
      })
      .addCase(confirmSquareOrder.fulfilled, (state, action) => {
        state.orders = action.payload;   // після рефетчу
        state.isConfirming = false;
        state.lastFetched = Date.now();
      })
      .addCase(confirmSquareOrder.rejected, (state, action) => {
        state.isConfirming = false;
        state.error = action.payload;
      })

      // ───────── updateOrderStatus (admin) ─────────
      .addCase(updateOrderStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload; // оновлений Order
        const idx = state.orders.findIndex((o) => o.id === updated.id);
        if (idx !== -1) state.orders[idx] = updated;
        state.isUpdatingStatus = false;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.error = action.payload;
      })

      // ───────── deleteOrder (admin) ─────────
      .addCase(deleteOrder.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((o) => o.id !== action.payload);
        state.isDeleting = false;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })

      // ───────── лог-аут: слухаємо синхронний екшен типу "auth/logout" ─────────
      .addMatcher(
        (action) => action?.type === "auth/logout",
        (state) => {
          state.orders = [];
          state.latest = null;
          state.loading = false;
          state.error = null;
          state.isCreating = false;
          state.isConfirming = false;
          state.isUpdatingStatus = false;
          state.isDeleting = false;
          state.lastFetched = null;
        }
      );
  },
});

export const { resetOrdersState } = ordersSlice.actions;
export default ordersSlice.reducer;
