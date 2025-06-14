# 🧩 Redux Tasks — CowboyLogic (2025-06-08)

## 🇺🇸 English

This checklist outlines the remaining work related to Redux Toolkit in the CowboyLogic frontend project.

## 🇺🇦 Українською

Цей список містить завдання, які ще потрібно виконати для Redux Toolkit у клієнтській частині CowboyLogic.

---

## ✅ State Slices (Already Implemented) / Вже реалізовано

- [x] `authSlice` — authentication
- [x] `bookSlice` — books (list, details)
- [x] `cartSlice` — shopping cart
- [x] `favoritesSlice` — user favorites
- [x] `ordersSlice` — order processing
- [x] `pageSlice` — editable pages
- [x] `notificationSlice` — alerts/messages

---

## ✅ Thunks & Async Logic

- [x] Thunks for `authSlice`: login, logout, getCurrentUser
- [x] Thunks for `book`, `cart`, `favorites`, `orders`, `pages`
- [x] Auto-dismiss thunk for `notificationSlice`
- [x] Proper error handling in all thunks via `try/catch`
- [x] Centralized notifications via `showSuccess` / `showError`

---

## ✅ Selectors

- [x] Selectors for `auth` (e.g., `user`, `token`, `isLoading`)
- [x] Selectors for `notification` added
- [x] Refactor usage to consistently use selectors across the app

---

## ✅ Loading/Error States

- [x] Add `isLoading` and `error` to all slices (`book`, `page`, `orders`, etc.)
- [x] Show `<Loader />` based on loading state from Redux

---

## 🧪 Testing

- [ ] Unit tests for all slices using Vitest
- [ ] Unit tests for all selectors
- [ ] Add tests for selectors and thunks (mock API calls)
- [ ] Snapshot tests for Redux-driven UI (`BookList`, `Orders`)

---

## 🧩 Integration

- [x] All axios calls moved into thunks
- [x] Ensure store structure is scalable for future features (e.g., ratings, reviews)
