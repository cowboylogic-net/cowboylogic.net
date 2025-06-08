import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCartItems } from "../../store/thunks/cartThunks";
import {
  updateItemQuantity,
  removeItemById,
} from "../../store/slices/cartSlice";
import {
  selectCartItems,
  selectCartTotal,
} from "../../store/selectors/cartSelectors";
import { toast } from "react-toastify";
import { apiService } from "../../services/axiosService";
import styles from "./Cart.module.css";
import CartItem from "../../components/CartItem/CartItem";

const Cart = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const items = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotal);
  const { isFetching, isAdding, error } = useSelector((state) => state.cart);

  useEffect(() => {
    if (!items.length) {
      dispatch(fetchCartItems());
    }
  }, [dispatch, items.length]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await apiService.patch(`/cart/${itemId}`, { quantity: newQuantity }, token);
      dispatch(updateItemQuantity({ itemId, quantity: newQuantity }));
      toast.success("Quantity updated");
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await apiService.delete(`/cart/${itemId}`, token);
      dispatch(removeItemById(itemId));
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleSquareCheckout = async () => {
    try {
      const res = await apiService.post(
        "/square/create-payment",
        {
          title: "My Book Order",
          price: totalPrice,
          bookId: items[0]?.bookId,
          userId: user.id,
        },
        token
      );
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      toast.error("Square checkout failed");
      console.error(err);
    }
  };

  if (isFetching) return <h2>Loading cart...</h2>;

  return (
    <div className={styles.cartPage}>
      <h2>My Cart</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className={styles.cartList}>
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </ul>

          <h3 className={styles.total}>Total: ${totalPrice.toFixed(2)}</h3>
          <button
            onClick={handleSquareCheckout}
            className={styles.checkoutBtn}
            disabled={isAdding}
          >
            Checkout with Square 💳
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
