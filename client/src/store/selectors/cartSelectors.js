// src/store/selectors/cartSelectors.js
import { createSelector } from 'reselect';
import { selectUser } from '../selectors/authSelectors'; 

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

export const selectCartBadgeCount = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce((total, item) => total + Number(item?.quantity || 0), 0)
);

// 🔧 БЕЗПЕЧНА версія для уникнення NaN:
export const selectCartTotal = createSelector(
  [selectCartItems, selectUser],
  (items, user) => {
    const isPartner = user?.role === "partner";

    return items.reduce((total, item) => {
      const quantity = Number(item.quantity || 0);
      const book = item?.Book;
      if (!book) return total;

      const rawPrice = isPartner
        ? Number(book.partnerPrice) || Number(book.price)
        : Number(book.price);

      return total + quantity * rawPrice;
    }, 0);
  }
);

