// src/pages/Orders/Orders.jsx
import styles from "./Orders.module.css";
import clsx from "clsx";
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
import ConfirmModal from "../../components/modals/ConfirmModal/ConfirmModal";
import Loader from "../../components/Loader/Loader";
import BaseButton from "../../components/BaseButton/BaseButton";
import BaseSelect from "../../components/BaseSelect/BaseSelect";

const TEN_MINUTES = 10 * 60 * 1000;
const safeParse = (str) => {
  try {
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
};

const Orders = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth.user);
  const orders = useSelector(selectAllOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const lastFetched = useSelector((s) => s.orders.lastFetched);

  const isAdmin = user?.role === "admin" || user?.isSuperAdmin;
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    const isStale = !lastFetched || Date.now() - lastFetched > TEN_MINUTES;
    if (user?.id && isStale) {
      if (isAdmin) dispatch(fetchAllOrders());
      else dispatch(fetchOrders());
    }
  }, [dispatch, user?.id, isAdmin, lastFetched]);

  const openDeleteModal = (orderId) => {
    setDeleteTargetId(orderId);
    setShowConfirm(true);
  };

  const closeDeleteModal = () => {
    setShowConfirm(false);
    setDeleteTargetId(null);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      dispatch(deleteOrder(deleteTargetId));
    }
    closeDeleteModal();
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="layoutContainer">
      <div className={styles.ordersPage}>
        <h2>{t("orders.title")}</h2>

        <div className={styles.controlsRow}>
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
        {!loading && !error && filteredOrders.length === 0 && (
          <p className={styles.empty}>{t("orders.noOrders")}</p>
        )}

        {!loading &&
          !error &&
          filteredOrders.length > 0 &&
          filteredOrders.map((order) => {
            const addr = safeParse(order.shippingAddressJson);

            return (
              <div key={order.id} className={styles.orderCard}>
                {/* Заголовок + статус */}
                <div className={styles.headerRow}>
                  <h4 className={styles.orderId}>
                    {t("orders.orderNumber", { id: order.id })}
                  </h4>
                  <span
                    className={clsx(
                      styles.statusBadge,
                      styles[`status_${order.status}`] // status_pending | status_completed
                    )}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Admin: покупець */}
                {isAdmin && (
                  <p className={styles.customer}>
                    <strong>Customer:</strong>{" "}
                    {order.User
                      ? `${order.User.fullName ?? "—"} (${order.User.email})`
                      : "—"}
                  </p>
                )}

                {/* Разом */}
                <div className={styles.metaRow}>
                  <div className={styles.total}>
                    {t("orders.total")}: $
                    {Number(order.totalPrice ?? 0).toFixed(2)}
                  </div>
                </div>

                {/* Доставка */}
                <div className={styles.shipBlock}>
                  <h5>Shipping</h5>
                  <p className={styles.shipLine}>
                    {order.shippingName || "—"}
                    {order.shippingPhone ? `, ${order.shippingPhone}` : ""}
                  </p>
                  {addr ? (
                    <>
                      <p className={styles.shipLine}>
                        {[addr.addressLine1, addr.addressLine2]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                      <p className={styles.shipLine}>
                        {[
                          addr.locality,
                          addr.administrativeDistrictLevel1,
                          addr.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                      <p className={styles.shipLine}>{addr.country || "—"}</p>
                    </>
                  ) : (
                    <p className={styles.shipLine}>—</p>
                  )}
                </div>

                {/* Items */}
                <ul className={styles.orderList}>
                  {(order.OrderItems || []).map((item) => (
                    <li key={item.id} className={styles.orderItem}>
                      <strong>{item.Book.title}</strong> — {item.quantity}{" "}
                      {t("orders.pcs")} @ ${Number(item.price ?? 0).toFixed(2)}
                    </li>
                  ))}
                </ul>

                {/* Admin-дії */}
                {isAdmin && (
                  <div className={styles.adminRow}>
                    <BaseSelect
                      name="status"
                      value={order.status}
                      onChange={(e) =>
                        dispatch(
                          updateOrderStatus({
                            orderId: order.id,
                            status: e.target.value,
                          })
                        )
                      }
                      options={[
                        { value: "pending", label: t("orders.pending") },
                        { value: "completed", label: t("orders.completed") },
                      ]}
                      compact
                    />
                    <BaseButton
                      onClick={() => openDeleteModal(order.id)}
                      variant="danger"
                      size="sm"
                    >
                      🗑 {t("orders.cancel")}
                    </BaseButton>
                  </div>
                )}
              </div>
            );
          })}
      </div>
      {showConfirm && (
        <ConfirmModal
          title={t("orders.deleteTitle", { defaultValue: t("confirm.title") })}
          message={t("orders.confirmDelete")}
          onConfirm={confirmDelete}
          onClose={closeDeleteModal}
        />
      )}
    </div>
  );
};

export default Orders;
