import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchOrders, deleteOrder } from "../../store/thunks/ordersThunks";
import {
  selectAllOrders,
  selectOrdersLoading,
  selectOrdersError,
} from "../../store/selectors/orderSelectors";
import Loader from "../../components/Loader/Loader";
import styles from "./Orders.module.css";
import BaseButton from "../../components/BaseButton/BaseButton";

const TEN_MINUTES = 10 * 60 * 1000;

const Orders = () => {
  const { t } = useTranslation();
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
    if (window.confirm(t("orders.confirmDelete"))) {
      dispatch(deleteOrder(orderId));
    }
  };

  return (
    <div className="layoutContainer">
      <div className={styles.ordersPage}>
        <h2>{t("orders.title")}</h2>

        {loading && <Loader />}
        {!loading && error && <p className={styles.error}>{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p>{t("orders.noOrders")}</p>
        )}

        {!loading &&
          !error &&
          orders.length > 0 &&
          orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <h4>{t("orders.orderNumber", { id: order.id })}</h4>
              <p>
                {t("orders.status")}: {order.status}
              </p>
              <p>
                {t("orders.total")}: ${order.totalPrice.toFixed(2)}
              </p>
              <ul className={styles.orderList}>
                {order.OrderItems.map((item) => (
                  <li key={item.id}>
                    <strong>{item.Book.title}</strong> — {item.quantity}{" "}
                    {t("orders.pcs")} @ ${item.price}
                  </li>
                ))}
              </ul>
              {user?.role === "admin" && (
                <BaseButton
                  onClick={() => handleDeleteOrder(order.id)}
                  variant="danger"
                  size="sm"
                >
                  🗑 {t("orders.cancel")}
                </BaseButton>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Orders;
