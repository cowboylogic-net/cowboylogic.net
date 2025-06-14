// src/store/selectors/cartSelectors.js
import { createSelector } from 'reselect';

const selectCart = (state) => state.cart;

export const selectCartItems = createSelector(
  [selectCart],
  (cart) => cart.items
);

export const selectCartCount = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce((total, item) => total + Number(item.quantity || 0), 0)
);

// 🔧 БЕЗПЕЧНА версія для уникнення NaN:
export const selectCartTotal = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce((total, item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item?.Book?.price || 0);
      return total + quantity * price;
    }, 0)
);
