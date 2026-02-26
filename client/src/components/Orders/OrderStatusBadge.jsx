import clsx from "clsx";
import styles from "./OrdersTable.module.css";

const OrderStatusBadge = ({ status, t }) => {
  const normalizedStatus =
    typeof status === "string" && status.trim()
      ? status.toLowerCase()
      : "pending";

  const label =
    typeof t === "function"
      ? normalizedStatus === "pending"
        ? t("orders.pending", { defaultValue: "Pending" })
        : normalizedStatus === "completed"
          ? t("orders.completed", { defaultValue: "Completed" })
          : normalizedStatus
      : normalizedStatus;

  return (
    <span
      className={clsx(
        styles.statusBadge,
        styles[`status_${normalizedStatus}`] || styles.status_default
      )}
      title={label}
    >
      {label}
    </span>
  );
};

export default OrderStatusBadge;