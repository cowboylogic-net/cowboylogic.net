// src/pages/Orders/Orders.jsx
import styles from "./Orders.module.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  fetchOrders,
  fetchAllOrders,
  deleteOrder,
  updateOrderStatus,
} from "../../store/thunks/ordersThunks";
import {
  selectAllOrders,
  selectOrdersLoading,
  selectOrdersError,
} from "../../store/selectors/orderSelectors";
import Loader from "../../components/Loader/Loader";
import BaseButton from "../../components/BaseButton/BaseButton";
import BaseSelect from "../../components/BaseSelect/BaseSelect";

const TEN_MINUTES = 10 * 60 * 1000;
const safeParse = (str) => { try { return str ? JSON.parse(str) : null; } catch { return null; } };

const Orders = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const orders = useSelector(selectAllOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const lastFetched = useSelector((s) => s.orders.lastFetched);

  const isAdmin = user?.role === "admin" || user?.isSuperAdmin; // ⬅️ ДОДАНО
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const isStale = !lastFetched || Date.now() - lastFetched > TEN_MINUTES;
    if (user?.id && isStale) {
      if (isAdmin) dispatch(fetchAllOrders()); // ⬅️ ОНОВЛЕНО
      else dispatch(fetchOrders());
    }
  }, [dispatch, user?.id, isAdmin, lastFetched]); // ⬅️ ОНОВЛЕНО залежності

  const handleDeleteOrder = (orderId) => {
    if (window.confirm(t("orders.confirmDelete"))) {
      dispatch(deleteOrder(orderId));
    }
  };

  const filteredOrders =
    statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="layoutContainer">
      <div className={styles.ordersPage}>
        <h2>{t("orders.title")}</h2>

        <div style={{ marginBottom: "var(--spacing-md)" }}>
          <BaseSelect
            name="status"
            label={t("orders.filterByStatus")}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: t("orders.all") },
              { value: "pending", label: t("orders.pending") },
              { value: "completed", label: t("orders.completed") },
            ]}
            compact
          />
        </div>

        {loading && <Loader />}
        {!loading && error && <p className={styles.error}>{error}</p>}
        {!loading && !error && filteredOrders.length === 0 && <p>{t("orders.noOrders")}</p>}

        {!loading && !error && filteredOrders.length > 0 && filteredOrders.map((order) => {
          const addr = safeParse(order.shippingAddressJson);

          return (
            <div key={order.id} className={styles.orderCard}>
              <h4>{t("orders.orderNumber", { id: order.id })}</h4>

              {/* Admin: показати покупця */}
              {isAdmin && ( // ⬅️ ОНОВЛЕНО
                <p>
                  <strong>Customer:</strong>{" "}
                  {order.User
                    ? `${order.User.fullName ?? "—"} (${order.User.email})` // ⬅️ ОНОВЛЕНО
                    : "—"}
                </p>
              )}

              <p>{t("orders.status")}: {order.status}</p>
              <p>{t("orders.total")}: ${Number(order.totalPrice ?? 0).toFixed(2)}</p>

              {/* SHIPPING */}
              <div className={styles.shipBlock}>
                <h5>Shipping</h5>
                <p>
                  {order.shippingName || "—"}
                  {order.shippingPhone ? `, ${order.shippingPhone}` : ""}
                </p>
                {addr ? (
                  <>
                    <p>{[addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ") || "—"}</p>
                    <p>{[addr.locality, addr.administrativeDistrictLevel1, addr.postalCode].filter(Boolean).join(", ") || "—"}</p>
                    <p>{addr.country || "—"}</p>
                  </>
                ) : <p>—</p>}
              </div>

              <ul className={styles.orderList}>
                {(order.OrderItems || []).map((item) => (
                  <li key={item.id}>
                    <strong>{item.Book.title}</strong> — {item.quantity} {t("orders.pcs")} @ ${Number(item.price ?? 0).toFixed(2)}
                  </li>
                ))}
              </ul>

              {/* Admin: керування */}
              {isAdmin && ( // ⬅️ ОНОВЛЕНО
                <div className={styles.adminRow} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <BaseSelect
                    name="status"
                    value={order.status}
                    onChange={(e) =>
                      dispatch(updateOrderStatus({ orderId: order.id, status: e.target.value }))
                    }
                    options={[
                      { value: "pending", label: t("orders.pending") },
                      { value: "completed", label: t("orders.completed") },
                    ]}
                    compact
                  />
                  <BaseButton onClick={() => handleDeleteOrder(order.id)} variant="danger" size="sm">
                    🗑 {t("orders.cancel")}
                  </BaseButton>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
