import clsx from "clsx";
import styles from "./OrdersTable.module.css";

const OrderStatusBadge = ({ status }) => {
  const normalizedStatus = typeof status === "string" ? status.toLowerCase() : "pending";

  return (
    <span
      className={clsx(
        styles.statusBadge,
        styles[`status_${normalizedStatus}`] || styles.status_default
      )}
    >
      {normalizedStatus}
    </span>
  );
};

export default OrderStatusBadge;
