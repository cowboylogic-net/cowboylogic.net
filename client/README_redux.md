# 🧩 Redux in CowboyLogic

## 🇺🇸 English

We use Redux Toolkit for global state management. The state is organized into slices, each with its own thunks and selectors.

## 🇺🇦 Українською

Ми використовуємо Redux Toolkit для керування глобальним станом. Стан організовано за слайсами, кожен має свої санки (thunks) та селектори.

### ✅ Slices / Слайси

- `authSlice.js` — authentication, user session
- `bookSlice.js` — list of books, book details
- `cartSlice.js` — shopping cart
- `favoritesSlice.js` — user's favorite books
- `ordersSlice.js` — user/admin order data
- `pageSlice.js` — editable content pages
- `notificationSlice.js` — alerts and messages

### 🪝 Thunks (Async Logic) / Санки

- `bookThunks.js`, `cartThunks.js`, `favoritesThunks.js`, `ordersThunks.js`, `pageThunks.js`
- Each thunk handles async fetch, create, update, delete operations.

### 🔍 Selectors / Селектори

- Located in `store/selectors/`
- Examples: `bookSelectors.js`, `orderSelectors.js`, `pageSelectors.js`

### 🧠 Integration

- All slices are connected via `store.jsx`
- `<Provider store={store}>` wraps the app in `main.jsx`
