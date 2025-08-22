import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { hideNotification } from "../../store/slices/notificationSlice";
import {
  selectNotificationMessage,
  selectNotificationType,
  selectNotificationVisible,
} from "../../store/selectors/notificationSelectors";
import { CheckCircle, XCircle, Info, AlertTriangle, X as Close } from "lucide-react";
import styles from "./Notification.module.css";

const getIcon = (type) => {
  switch (type) {
    case "success":
      return <CheckCircle className={styles.icon} />;
    case "error":
      return <XCircle className={styles.icon} />;
    case "info":
      return <Info className={styles.icon} />;
    case "warning":
      return <AlertTriangle className={styles.icon} />;
    default:
      return null;
  }
};

const Notification = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const message = useSelector(selectNotificationMessage);
  const type = useSelector(selectNotificationType);
  const isVisible = useSelector(selectNotificationVisible);

  if (!isVisible || !message) return null;

  const translatedMessage =
    typeof message === "string" ? message : t(message.key, message.options);

  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {getIcon(type)}
      <span className={styles.text}>{translatedMessage}</span>

      {/* Ручне закриття head-елемента черги */}
      <button
        type="button"
        className={styles.close}
        aria-label={t("common.close", "Close")}
        onClick={() => dispatch(hideNotification())}
      >
        <Close size={16} />
      </button>
    </div>
  );
};

export default Notification;
