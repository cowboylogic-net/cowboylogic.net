import { createSlice } from "@reduxjs/toolkit";
import { fetchCartItems, addToCartThunk } from "../thunks/cartThunks";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    error: null,
    isFetching: false,
    isAdding: false,
  },
  reducers: {
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    replaceCart: (state, action) => {
      state.items = action.payload;
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
        state.items = action.payload; // ✅ payload — це повний масив з fetchCartItems
        state.isAdding = false;
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
  updateItemQuantity,
  removeItemById,
} = cartSlice.actions;

export default cartSlice.reducer;

