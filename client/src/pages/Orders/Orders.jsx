// src/pages/Orders/Orders.jsx
import styles from "./Orders.module.css";
import { useCallback, useEffect, useState } from "react";
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
import OrdersTable from "../../components/Orders/OrdersTable";

const PAGE_SIZE = 20;

const Orders = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth.user);
  const orders = useSelector(selectAllOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);

  const isAdmin = user?.role === "admin" || user?.isSuperAdmin;
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadOrders = useCallback(
    async (nextPage, append) => {
      if (!user?.id) return;

      if (append) setIsLoadingMore(true);

      try {
        const fetchThunk = isAdmin ? fetchAllOrders : fetchOrders;
        const payload = await dispatch(
          fetchThunk({
            page: nextPage,
            limit: PAGE_SIZE,
            status: statusFilter,
            append,
          })
        ).unwrap();

        setPage(payload?.pagination?.page ?? nextPage);
        setHasMore(Boolean(payload?.pagination?.hasMore));
      } catch {
        setHasMore(false);
      } finally {
        if (append) setIsLoadingMore(false);
      }
    },
    [dispatch, isAdmin, statusFilter, user?.id]
  );

  useEffect(() => {
    setPage(1);
    setHasMore(false);
    loadOrders(1, false);
  }, [loadOrders]);

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

  const handleLoadMore = () => {
    if (!hasMore || loading || isLoadingMore) return;
    loadOrders(page + 1, true);
  };

  return (
    <div className="layoutContainer">
      <div className={styles.ordersPage} data-testid="orders-page">
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
        {!loading && !error && orders.length === 0 && (
          <p className={styles.empty}>{t("orders.noOrders")}</p>
        )}

        {!loading && !error && orders.length > 0 && (
          <OrdersTable
            orders={orders}
            isAdmin={isAdmin}
            t={t}
            onDelete={openDeleteModal}
            onStatusChange={(orderId, status) =>
              dispatch(updateOrderStatus({ orderId, status }))
            }
          />
        )}

        {!loading && !error && hasMore && (
          <div className={styles.loadMoreRow}>
            <BaseButton onClick={handleLoadMore} disabled={isLoadingMore}>
              {isLoadingMore
                ? t("orders.loadingMore", { defaultValue: "Loading..." })
                : t("orders.loadMore", { defaultValue: "Load more" })}
            </BaseButton>
          </div>
        )}
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
