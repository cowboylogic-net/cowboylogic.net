import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCartItems,
  addToCartThunk,
  updateCartItemQuantity,
  deleteCartItemThunk,
  clearCartThunk,
} from "../thunks/cartThunks";
import { logoutUser } from "../thunks/authThunks";

const getInitialState = () => ({
  items: [],
  error: null,
  isFetching: false,
  isAdding: false,
  isUpdating: false,
  isDeleting: false,
});

const cartSlice = createSlice({
  name: "cart",
  initialState: getInitialState(),
  reducers: {
    resetCartState: () => getInitialState(),
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
        state.items = action.payload;
        state.isAdding = false;
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.isAdding = false;
      })
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isUpdating = false;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.error = action.payload;
        state.isUpdating = false;
      })

      .addCase(deleteCartItemThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCartItemThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isDeleting = false;
      })
      .addCase(deleteCartItemThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.isDeleting = false;
      })

      .addCase(clearCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(clearCartThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, () => getInitialState())
      .addCase("auth/sessionExpired", () => getInitialState());
  },
});

export const {
  resetCartState,
  removeFromCart,
  clearCart,
  replaceCart,
  updateItemQuantity,
  removeItemById,
} = cartSlice.actions;

export default cartSlice.reducer;
