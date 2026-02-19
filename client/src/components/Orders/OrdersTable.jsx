import styles from "./OrdersTable.module.css";
import BaseButton from "../BaseButton/BaseButton";
import OrderStatusBadge from "./OrderStatusBadge";

const safeParse = (str) => {
  try {
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
};

const formatShipping = (order) => {
  const addr = safeParse(order?.shippingAddressJson);
  const line1 = [addr?.addressLine1, addr?.addressLine2].filter(Boolean).join(", ");
  const line2 = [
    addr?.locality,
    addr?.administrativeDistrictLevel1,
    addr?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
  const line3 = addr?.country || "";

  return [order?.shippingName, order?.shippingPhone, line1, line2, line3]
    .filter(Boolean)
    .join(" | ");
};

const OrdersTable = ({ orders = [], isAdmin = false, onStatusChange, onDelete, t }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} data-testid="orders-table">
        <thead>
          <tr>
            <th>{t("orders.order", { defaultValue: "Order" })}</th>
            <th>{t("orders.date", { defaultValue: "Date" })}</th>
            {isAdmin && <th>{t("orders.customer", { defaultValue: "Customer" })}</th>}
            <th>{t("orders.items", { defaultValue: "Items" })}</th>
            <th>{t("orders.shipping", { defaultValue: "Shipping" })}</th>
            <th>{t("orders.total")}</th>
            <th>{t("orders.status")}</th>
            {isAdmin && <th>{t("orders.actions", { defaultValue: "Actions" })}</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <div className={styles.orderIdText}>{order.id}</div>
              </td>
              <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</td>
              {isAdmin && (
                <td>
                  {order.User
                    ? `${order.User.fullName ?? "-"} (${order.User.email})`
                    : "-"}
                </td>
              )}
              <td>
                <div className={styles.itemsCell}>
                  {(order.OrderItems || []).map((item) => (
                    <div key={item.id}>
                      {item.Book?.title || "-"} x {item.quantity} @ $
                      {Number(item.price ?? 0).toFixed(2)}
                    </div>
                  ))}
                </div>
              </td>
              <td>{formatShipping(order) || "-"}</td>
              <td>${Number(order.totalPrice ?? 0).toFixed(2)}</td>
              <td>
                <OrderStatusBadge status={order.status} />
              </td>
              {isAdmin && (
                <td>
                  <div className={styles.actionsCell}>
                    <select
                      className={styles.statusSelect}
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      aria-label={`Update status for order ${order.id}`}
                    >
                      <option value="pending">{t("orders.pending")}</option>
                      <option value="completed">{t("orders.completed")}</option>
                    </select>
                    <BaseButton
                      onClick={() => onDelete(order.id)}
                      variant="danger"
                      size="sm"
                    >
                      {t("orders.cancel")}
                    </BaseButton>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
