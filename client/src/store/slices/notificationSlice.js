import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} I18nMessage
 * @property {string} key
 * @property {Object} [options]
 */

/**
 * @typedef {Object} NotificationItem
 * @property {string} id
 * @property {'success'|'error'|'info'|'warning'} type
 * @property {string|I18nMessage} message
 * @property {number} timeout
 */

/**
 * @typedef {Object} NotificationState
 * @property {string | I18nMessage | null} message    // head of queue (для зворотної сумісності)
 * @property {'success' | 'error' | 'info' | 'warning' | null} type
 * @property {boolean} isVisible
 * @property {NotificationItem[]} queue               // повна черга
 */

const initialState = /** @type {NotificationState} */ ({
  message: null,
  type: null,
  isVisible: false,
  queue: [],
});

const updateHead = (state) => {
  const head = state.queue[0];
  if (head) {
    state.message = head.message;
    state.type = head.type;
    state.isVisible = true;
  } else {
    state.message = null;
    state.type = null;
    state.isVisible = false;
  }
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // ⬇️ ЗАЛИШАЄМО ДЛЯ СУМІСНОСТІ: додає у чергу
    showNotification: (state, action) => {
      const { message, type, timeout = 3000, id } = action.payload || {};
      const itemId = id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      state.queue.push({ id: itemId, message, type, timeout });
      // якщо це перший елемент — оновити head
      if (state.queue.length === 1) updateHead(state);
    },

    // ⬇️ ЗАЛИШАЄМО ДЛЯ СУМІСНОСТІ: знімає поточну нотифікацію (head)
    hideNotification: (state) => {
      if (state.queue.length > 0) state.queue.shift();
      updateHead(state);
    },

    // ⬇️ НОВЕ: приховати елемент за id (безпечне авто-закриття з таймера)
    hideNotificationById: (state, action) => {
      const id = action.payload;
      const idx = state.queue.findIndex((n) => n.id === id);
      if (idx >= 0) state.queue.splice(idx, 1);
      updateHead(state);
    },

    // ⬇️ НОВЕ: очистити всю чергу
    clearAllNotifications: (state) => {
      state.queue = [];
      updateHead(state);
    },
  },
});

export const {
  showNotification,
  hideNotification,
  hideNotificationById,
  clearAllNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
