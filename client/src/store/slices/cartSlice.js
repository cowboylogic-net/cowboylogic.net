// cartSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchCartItems, addToCartThunk } from '../thunks/cartThunks';

const localCart = JSON.parse(localStorage.getItem('cart')) || [];

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: localCart,
    error: null,
    isFetching: false,
    isAdding: false,
  },
  reducers: {
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
    replaceCart: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('cart', JSON.stringify(action.payload));
    },
    updateItemQuantity: (state, action) => {
  const { itemId, quantity } = action.payload;
  const item = state.items.find((i) => i.id === itemId);
  if (item) {
    item.quantity = quantity;
  }
},
removeItemById: (state, action) => {
  const itemId = action.payload;
  state.items = state.items.filter((i) => i.id !== itemId);
},
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isFetching = false;
        localStorage.setItem('cart', JSON.stringify(action.payload));
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.error = action.payload;
        state.isFetching = false;
      })
      .addCase(addToCartThunk.pending, (state) => {
        state.isAdding = true;
        state.error = null;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        const existing = state.items.find(item => item.id === action.payload.id);
        if (existing) {
          existing.quantity += action.payload.quantity;
        } else {
          state.items.push(action.payload);
        }
        state.isAdding = false;
        localStorage.setItem('cart', JSON.stringify(state.items));
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.isAdding = false;
      });
  },
});

export const {
  removeFromCart,
  clearCart,
  replaceCart,
} = cartSlice.actions;

export default cartSlice.reducer;
