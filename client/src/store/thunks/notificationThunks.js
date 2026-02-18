import { showNotification, hideNotificationById } from '../slices/notificationSlice.js';
import { getUiErrorMessage } from '../../utils/uiErrorMessage.js';

export const showTemporaryNotification = (payload, timeout = 3000) => (dispatch) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const item = { ...payload, id, timeout };
  dispatch(showNotification(item));
  setTimeout(() => {
    dispatch(hideNotificationById(id));
  }, item.timeout ?? timeout);
};

// ✅ Універсальні хелпери з підтримкою i18n-повідомлень
export const showSuccess = (keyOrMsg, optionsOrTimeout, timeoutOverride) => {
  let payload;
  if (typeof keyOrMsg === 'string' && typeof optionsOrTimeout === 'number') {
    payload = { message: keyOrMsg, type: 'success' };
    return showTemporaryNotification(payload, optionsOrTimeout);
  }
  if (typeof keyOrMsg === 'string' && typeof optionsOrTimeout === 'object') {
    payload = { message: { key: keyOrMsg, options: optionsOrTimeout }, type: 'success' };
    return showTemporaryNotification(payload, timeoutOverride || 3000);
  }
  if (typeof keyOrMsg === 'object') {
    payload = { message: keyOrMsg, type: 'success' };
    return showTemporaryNotification(payload, timeoutOverride || 3000);
  }
  payload = { message: String(keyOrMsg), type: 'success' };
  return showTemporaryNotification(payload, 3000);
};

export const showError = (keyOrMsg, optionsOrTimeout, timeoutOverride) => {
  let payload;
  if (typeof keyOrMsg === 'string' && typeof optionsOrTimeout === 'number') {
    payload = { message: keyOrMsg, type: 'error' };
    return showTemporaryNotification(payload, optionsOrTimeout);
  }
  if (typeof keyOrMsg === 'string' && typeof optionsOrTimeout === 'object') {
    payload = { message: { key: keyOrMsg, options: optionsOrTimeout }, type: 'error' };
    return showTemporaryNotification(payload, timeoutOverride || 3000);
  }
  const isErrorLike =
    keyOrMsg instanceof Error ||
    (keyOrMsg &&
      typeof keyOrMsg === 'object' &&
      ('response' in keyOrMsg ||
        'request' in keyOrMsg ||
        'apiError' in keyOrMsg ||
        'status' in keyOrMsg ||
        'code' in keyOrMsg));
  if (isErrorLike) {
    const fallbackMessage = typeof optionsOrTimeout === 'string' ? optionsOrTimeout : null;
    const timeout =
      typeof optionsOrTimeout === 'number'
        ? optionsOrTimeout
        : timeoutOverride || 3000;
    payload = { message: getUiErrorMessage(keyOrMsg, fallbackMessage), type: 'error' };
    return showTemporaryNotification(payload, timeout);
  }
  if (typeof keyOrMsg === 'object') {
    payload = { message: keyOrMsg, type: 'error' };
    return showTemporaryNotification(payload, timeoutOverride || 3000);
  }
  payload = { message: String(keyOrMsg), type: 'error' };
  return showTemporaryNotification(payload, 3000);
};
