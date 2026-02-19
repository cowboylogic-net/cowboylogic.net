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
  page: 1,
  limit: 20,
  total: 0,
  hasMore: false,
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
    const applyOrdersPayload = (state, action) => {
      const payload = action.payload;
      const items = Array.isArray(payload) ? payload : payload?.items || [];
      const append = !Array.isArray(payload) && payload?.append === true;

      if (append) {
        const existingById = new Map(state.orders.map((order) => [order.id, order]));
        for (const order of items) {
          existingById.set(order.id, order);
        }
        state.orders = Array.from(existingById.values());
      } else {
        state.orders = items;
      }

      const pagination = !Array.isArray(payload) ? payload?.pagination : null;
      if (pagination) {
        state.page = pagination.page ?? state.page;
        state.limit = pagination.limit ?? state.limit;
        state.total = pagination.total ?? state.total;
        state.hasMore = Boolean(pagination.hasMore);
      } else {
        state.page = 1;
        state.limit = items.length || state.limit;
        state.total = items.length;
        state.hasMore = false;
      }
    };

    builder
      // ───────── fetchOrders (user) ─────────
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        applyOrdersPayload(state, action);
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
        applyOrdersPayload(state, action);
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
          state.page = 1;
          state.limit = 20;
          state.total = 0;
          state.hasMore = false;
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
