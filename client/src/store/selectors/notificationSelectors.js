// src/store/selectors/notificationSelectors.js
export const selectNotificationVisible = (s) => s.notification.isVisible;
export const selectNotificationMessage = (s) => s.notification.message;
export const selectNotificationType = (s) => s.notification.type;
export const selectNotificationQueue = (s) => s.notification.queue;
