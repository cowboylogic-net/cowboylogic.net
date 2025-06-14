// src/store/selectors/notificationSelectors.js

export const selectNotificationMessage = (state) => state.notification.message;
export const selectNotificationType = (state) => state.notification.type;
export const selectNotificationVisible = (state) => state.notification.isVisible;
