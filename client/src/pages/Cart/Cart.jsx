import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCartItems } from "../../store/thunks/cartThunks";
import {
  updateItemQuantity,
  removeItemById,
} from "../../store/slices/cartSlice";
import { toast } from "react-toastify";
import { apiService } from "../../services/axiosService";
import styles from "./Cart.module.css";

const Cart = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);
  const error = useSelector((state) => state.cart.error);

  // ✅ Завантаження кошика лише якщо він порожній
  useEffect(() => {
    if (!items.length) {
      dispatch(fetchCartItems());
    }
  }, [dispatch, items.length]);

  // ✅ Оновлення кількості без повторного fetch
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

  // ✅ Видалення без refetch
  const handleRemove = async (itemId) => {
    try {
      await apiService.delete(`/cart/${itemId}`, token);
      dispatch(removeItemById(itemId));
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  // ✅ Мемоізація totalPrice
  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.Book.price, 0);
  }, [items]);

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

  return (
    <div className={styles["cart-page"]}>
      <h2>My Cart</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <strong>{item.Book.title}</strong>
                <span className={styles.price}> — ${item.Book.price}</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, Number(e.target.value))
                  }
                />
                <button onClick={() => handleRemove(item.id)}>Remove</button>
              </li>
            ))}
          </ul>

          <h3>Total: ${totalPrice.toFixed(2)}</h3>
          <button
            onClick={handleSquareCheckout}
            className="btn btn-outline btn-checkout"
          >
            Checkout with Square 💳
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
