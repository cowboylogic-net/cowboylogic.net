import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideNotification } from "../../store/slices/notificationSlice";
import styles from "./Notification.module.css";
import {
  selectNotificationMessage,
  selectNotificationType,
  selectNotificationVisible,
} from "../../store/selectors/notificationSelectors";

const Notification = () => {
  const dispatch = useDispatch();
  const message = useSelector(selectNotificationMessage);
  const type = useSelector(selectNotificationType);
  const isVisible = useSelector(selectNotificationVisible);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, dispatch]);

  if (!isVisible || !message) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      {message}
    </div>
  );
};

export default Notification;
