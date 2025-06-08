import { createSelector } from "reselect";

export const selectOrdersState = (state) => state.orders;

export const selectAllOrders = createSelector(
  [selectOrdersState],
  (state) => state.orders
);

export const selectOrdersLoading = createSelector(
  [selectOrdersState],
  (state) => state.loading
);

export const selectOrdersError = createSelector(
  [selectOrdersState],
  (state) => state.error
);
