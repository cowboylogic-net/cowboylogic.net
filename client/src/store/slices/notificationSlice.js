import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} I18nMessage
 * @property {string} key - ключ для t()
 * @property {Object} [options] - змінні для шаблону, напр. { title: "Book" }
 */

/**
 * @typedef {Object} NotificationState
 * @property {string | I18nMessage | null} message
 * @property {'success' | 'error' | 'info' | 'warning' | null} type
 * @property {boolean} isVisible
 */

const initialState = {
  /** @type {string | I18nMessage | null} */
  message: null,
  type: null,
  isVisible: false,
};

/**
 * Slice для глобальних нотифікацій
 */
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    /**
     * Показує повідомлення з типом
     * @param {NotificationState} state
     * @param {{ payload: { message: string | I18nMessage, type: string } }} action
     */
    showNotification: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.isVisible = true;
    },

    /**
     * Ховає повідомлення
     * @param {NotificationState} state
     */
    hideNotification: (state) => {
      state.message = null;
      state.type = null;
      state.isVisible = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
