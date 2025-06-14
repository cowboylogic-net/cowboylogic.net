// src/store/thunks/notificationThunks.js

import { showNotification, hideNotification } from '../slices/notificationSlice';

// 🔁 Show notification temporarily (auto-dismiss)
export const showTemporaryNotification = (payload, timeout = 3000) => (dispatch) => {
  dispatch(showNotification(payload));
  setTimeout(() => {
    dispatch(hideNotification());
  }, timeout);
};

// ✅ Shortcuts
export const showSuccess = (message, timeout = 3000) =>
  showTemporaryNotification({ message, type: 'success' }, timeout);

export const showError = (message, timeout = 3000) =>
  showTemporaryNotification({ message, type: 'error' }, timeout);
