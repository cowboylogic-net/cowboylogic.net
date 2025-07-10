import { createSlice } from "@reduxjs/toolkit";
import { fetchOrders, deleteOrder } from "../thunks/ordersThunks";

const initialState = {
  orders: [],
  loading: false,
  error: null,
  lastFetched: null,
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
        state.lastFetched = Date.now();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((o) => o.id !== action.payload);
      })
      // ⛔️ Instead of logoutUser.fulfilled — use matcher for action type:
      .addMatcher(
        (action) => action.type === "auth/logoutUser/fulfilled",
        (state) => {
          state.orders = [];
          state.loading = false;
          state.error = null;
          state.lastFetched = null;
        }
      );
  },
});

export default ordersSlice.reducer;
