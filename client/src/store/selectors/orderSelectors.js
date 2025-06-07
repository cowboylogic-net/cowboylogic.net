import { createSelector } from "reselect";

export const selectOrdersState = (state) => state.orders;

export const selectAllOrders = createSelector(
  [selectOrdersState],
  (ordersState) => ordersState.orders
);

export const selectOrdersLoading = createSelector(
  [selectOrdersState],
  (ordersState) => ordersState.loading
);

export const selectOrdersError = createSelector(
  [selectOrdersState],
  (ordersState) => ordersState.error
);
