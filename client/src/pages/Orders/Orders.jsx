import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchOrders,
  deleteOrder,
} from "../../store/thunks/ordersThunks";
import {
  selectAllOrders,
  selectOrdersLoading,
  selectOrdersError,
} from "../../store/selectors/orderSelectors";
import Loader from "../../components/Loader/Loader";
import styles from "./Orders.module.css";

const TEN_MINUTES = 10 * 60 * 1000;

const Orders = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
    const orders = useSelector(selectAllOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const lastFetched = useSelector((state) => state.orders.lastFetched);

  useEffect(() => {
    const isStale = !lastFetched || Date.now() - lastFetched > TEN_MINUTES;
    if (user?.id && isStale) {
      dispatch(fetchOrders());
    }
  }, [dispatch, user?.id, lastFetched]);

  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      dispatch(deleteOrder(orderId));
    }
  };

  return (
    <div className={styles.ordersPage}>
      <h2>My Orders</h2>

      {loading && <Loader />}
      {!loading && error && <p className={styles.error}>{error}</p>}
      {!loading && !error && orders.length === 0 && <p>No orders yet.</p>}

      {!loading && !error && orders.length > 0 && (
        orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <h4>Order #{order.id}</h4>
            <p>Status: {order.status}</p>
            <p>Total: ${order.totalPrice.toFixed(2)}</p>
            <ul className={styles.orderList}>
              {order.OrderItems.map((item) => (
                <li key={item.id}>
                  <strong>{item.Book.title}</strong> — {item.quantity} pcs @ ${item.price}
                </li>
              ))}
            </ul>
            {user?.role === "admin" && (
              <button
                onClick={() => handleDeleteOrder(order.id)}
                className={styles.cancelButton}
              >
                🗑 Cancel Order
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
