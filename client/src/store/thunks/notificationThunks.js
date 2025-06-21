
// import { showNotification, hideNotification } from '../slices/notificationSlice';


// export const showTemporaryNotification = (payload, timeout = 3000) => (dispatch) => {
//   dispatch(showNotification(payload));
//   setTimeout(() => {
//     dispatch(hideNotification());
//   }, timeout);
// };

// export const showSuccess = (message, timeout = 3000) =>
//   showTemporaryNotification({ message, type: 'success' }, timeout);

// export const showError = (message, timeout = 3000) =>
//   showTemporaryNotification({ message, type: 'error' }, timeout);
// src/store/thunks/notificationThunks.js
import { showNotification, hideNotification } from '../slices/notificationSlice';

export const showTemporaryNotification = (payload, timeout = 3000) => (dispatch) => {
  dispatch(showNotification(payload));
  setTimeout(() => {
    dispatch(hideNotification());
  }, timeout);
};

// ✅ Новий варіант з підтримкою ключів
export const showSuccess = (keyOrMsg, optionsOrTimeout, timeoutOverride) => {
  if (typeof keyOrMsg === 'string' && typeof optionsOrTimeout === 'number') {
    return showTemporaryNotification({ message: keyOrMsg, type: 'success' }, optionsOrTimeout);
  }

  if (typeof keyOrMsg === 'string' && typeof optionsOrTimeout === 'object') {
    return showTemporaryNotification({ message: { key: keyOrMsg, options: optionsOrTimeout }, type: 'success' });
  }

  if (typeof keyOrMsg === 'object') {
    return showTemporaryNotification({ message: keyOrMsg, type: 'success' }, timeoutOverride || 3000);
  }

  return showTemporaryNotification({ message: String(keyOrMsg), type: 'success' }, 3000);
};

export const showError = (keyOrMsg, optionsOrTimeout, timeoutOverride) => {
  if (typeof keyOrMsg === 'string' && typeof optionsOrTimeout === 'number') {
    return showTemporaryNotification({ message: keyOrMsg, type: 'error' }, optionsOrTimeout);
  }

  if (typeof keyOrMsg === 'string' && typeof optionsOrTimeout === 'object') {
    return showTemporaryNotification({ message: { key: keyOrMsg, options: optionsOrTimeout }, type: 'error' });
  }

  if (typeof keyOrMsg === 'object') {
    return showTemporaryNotification({ message: keyOrMsg, type: 'error' }, timeoutOverride || 3000);
  }

  return showTemporaryNotification({ message: String(keyOrMsg), type: 'error' }, 3000);
};
