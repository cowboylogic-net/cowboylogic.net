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

const formatDateParts = (createdAt) => {
  if (!createdAt) return { date: "-", time: "" };
  const d = new Date(createdAt);
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

const getShippingLines = (order) => {
  const addr = safeParse(order?.shippingAddressJson);
  const line1 = [addr?.addressLine1, addr?.addressLine2]
    .filter(Boolean)
    .join(", ");
  const line2 = [
    addr?.locality,
    addr?.administrativeDistrictLevel1,
    addr?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
  const line3 = addr?.country || "";

  return [
    order?.shippingName,
    order?.shippingPhone,
    line1,
    line2,
    line3,
  ].filter(Boolean);
};

const OrdersTable = ({
  orders = [],
  isAdmin = false,
  onStatusChange,
  onDelete,
  t,
}) => {
  const thOrder = t("orders.order", { defaultValue: "Order" });
  const thDate = t("orders.date", { defaultValue: "Date" });
  const thCustomer = t("orders.customer", { defaultValue: "Customer" });
  const thItems = t("orders.items", { defaultValue: "Items" });
  const thShipping = t("orders.shipping", { defaultValue: "Shipping" });
  const thTotal = t("orders.total", { defaultValue: "Total" });
  const thStatus = t("orders.status", { defaultValue: "Status" });
  const thActions = t("orders.actions", { defaultValue: "Actions" });

  return (
    <div className={styles.tableWrapper}>
      <table
        className={`${styles.table} ${isAdmin ? styles.tableAdmin : ""}`.trim()}
        data-testid="orders-table"
      >
        <colgroup>
          <col className={styles.colOrder} />
          <col className={styles.colDate} />
          {isAdmin && <col className={styles.colCustomer} />}
          <col className={styles.colItems} />
          <col className={styles.colShipping} />
          <col className={styles.colTotal} />
          <col className={styles.colStatus} />
          {isAdmin && <col className={styles.colActions} />}
        </colgroup>

        <thead>
          <tr>
            <th>{thOrder}</th>
            <th>{thDate}</th>
            {isAdmin && <th>{thCustomer}</th>}
            <th>{thItems}</th>
            <th>{thShipping}</th>
            <th>{thTotal}</th>
            <th>{thStatus}</th>
            {isAdmin && <th>{thActions}</th>}
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => {
            const { date, time } = formatDateParts(order.createdAt);
            const shippingLines = getShippingLines(order);

            const customerName = order?.User?.fullName ?? "-";
            const customerEmail = order?.User?.email ?? "-";

            return (
              <tr key={order.id}>
                <td data-label={thOrder}>
                  <div className={styles.cellValue}>
                    <div className={styles.orderIdText} title={order.id}>
                      {order.id}
                    </div>
                  </div>
                </td>

                <td data-label={thDate}>
                  <div className={styles.cellValue}>
                    <div className={styles.dateCell}>
                      <div>{date}</div>
                      {time ? (
                        <div className={styles.dateTimeMuted}>{time}</div>
                      ) : null}
                    </div>
                  </div>
                </td>

                {isAdmin && (
                  <td data-label={thCustomer}>
                    <div className={styles.cellValue}>
                      <div className={styles.customerCell}>
                        <div
                          className={styles.customerName}
                          title={customerName}
                        >
                          {customerName}
                        </div>
                        <div
                          className={styles.customerEmail}
                          title={customerEmail}
                        >
                          {customerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                )}

                <td data-label={thItems}>
                  <div className={styles.cellValue}>
                    <div className={styles.itemsCell}>
                      {(order.OrderItems || []).length ? (
                        (order.OrderItems || []).map((item) => (
                          <div key={item.id} className={styles.itemLine}>
                            <span
                              className={styles.itemTitle}
                              title={item.Book?.title || "-"}
                            >
                              {item.Book?.title || "-"}
                            </span>
                            <span className={styles.itemMeta}>
                              x {item.quantity} @ $
                              {Number(item.price ?? 0).toFixed(2)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className={styles.muted}>-</div>
                      )}
                    </div>
                  </div>
                </td>

                <td data-label={thShipping}>
                  <div className={styles.cellValue}>
                    {shippingLines.length ? (
                      <div className={styles.shippingCell}>
                        {shippingLines.map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.muted}>-</div>
                    )}
                  </div>
                </td>

                <td data-label={thTotal}>
                  <div className={styles.cellValue}>
                    ${Number(order.totalPrice ?? 0).toFixed(2)}
                  </div>
                </td>

                <td data-label={thStatus}>
                  <div className={styles.cellValue}>
                    <OrderStatusBadge status={order.status} t={t} />
                  </div>
                </td>

                {isAdmin && (
                  <td data-label={thActions}>
                    <div className={styles.cellValue}>
                      <div className={styles.actionsCell}>
                        <select
                          className={styles.statusSelect}
                          value={order.status}
                          onChange={(e) =>
                            onStatusChange(order.id, e.target.value)
                          }
                          aria-label={`Update status for order ${order.id}`}
                        >
                          <option value="pending">
                            {t("orders.pending", { defaultValue: "Pending" })}
                          </option>
                          <option value="completed">
                            {t("orders.completed", {
                              defaultValue: "Completed",
                            })}
                          </option>
                        </select>

                        <div className={styles.cancelBtnWrap}>
                          <BaseButton
                            onClick={() => onDelete(order.id)}
                            variant="danger"
                            size="sm"
                          >
                            {t("orders.cancel", {
                              defaultValue: "Cancel Order",
                            })}
                          </BaseButton>
                        </div>
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
