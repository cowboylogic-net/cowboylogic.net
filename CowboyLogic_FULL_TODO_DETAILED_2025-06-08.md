
# 📋 CowboyLogic: Full TODO (Detailed & Verified) / Повний Тудушник (Фактологічний Аналіз)

_Last full scan: 2025-06-08

---

## ✅ GENERAL STATUS

- 🔍 All 3 ZIP archives analyzed (`client`, `server`, `full_project`)
- 📁 Client folder is nested under `client/client/`
- 🧠 All Redux slices, pages, and components are physically present
- 🧪 Test files are **not** present — testing still not implemented
- 🛡 Security logic confirmed via backend structure and middleware

---

## 🧩 FRONTEND TODO (Detailed)

### 🔐 Authentication

- [x] Login + 2FA (`LoginForm.jsx`, `authThunks.js`)
- [x] Google Login (`/auth/google`)
- [x] Role-based routing (`AdminRoute.jsx`, `PrivateRoute.jsx`)
- [ ] ⏳ Form validation in `RegisterForm.jsx`, `ResetPasswordForm.jsx`, `AddBook.jsx`, `Newsletter.jsx`

### 🌍 i18n

- [x] LoginForm and LanguageSwitcher implemented
- [x] `i18n.js` + locales/en + locales/es present
- [ ] ❗ Translate Footer, Navbar, Cart, FavoritesPage, AdminDashboard
- [ ] ❗ Translate all `ConfirmModal`, `ImageInsertModal`, etc.
- [ ] ❗ Add i18n to Notification system and form errors

### 📦 Redux

- [x] All slices present: `authSlice`, `bookSlice`, `cartSlice`, `favoritesSlice`, `ordersSlice`, `pageSlice`, `notificationSlice`
- [x] All thunks present
- [ ] ❗ Error handling missing in thunks (try/catch)

### ✍️ Editable Pages

- [x] `EditablePage.jsx` with working toolbar
- [x] `ImageInsertModal`, `LinkInsertModal`, `ConfirmModal`
- [x] `PUT /pages/:slug` + `/draft` + `/versions` supported
- [ ] ❗ HTML confirmation requires extra validation
- [ ] ❗ Autosave not implemented yet
- [ ] ❗ Draft rendering on frontend not finalized

### 💳 Payments

- [x] `paymentService.js` with `create-checkout-session`
- [x] `SuccessPage`, `CancelPage`, `Square` webhook
- [ ] ❗ UX: show spinner during payment
- [ ] ❗ Clear cart on payment success

### 📱 UI/UX

- [ ] ❗ Improve mobile modals
- [ ] ❗ Fix hover on links, navbar items, buttons
- [ ] ❗ Add alt-texts to all `<img>`
- [ ] ⏳ Add Helmet for SEO
- [ ] ⏳ 404 fallback page
- [ ] ⏳ Lazy load: Orders.jsx, BookDetails.jsx

### 🧪 Testing

- [ ] ❗ Add React Testing Library / Vitest
- [ ] ❗ Unit tests for Redux slices
- [ ] ❗ Snapshot tests for `BookList`, `EditablePage`

---

## 🛠 BACKEND TODO (Detailed)

### ✅ Implemented

- [x] `Favorite` controller + routes + model
- [x] `resetPasswordController.js`
- [x] Square integration: `squareController.js` + webhook
- [x] Upload via `uploadMiddleware.js` with MIME/type check
- [x] Role-based middleware: `protect`, `requireRole`, `isAdmin`, `isSuperAdmin`

### 🔐 Security Enhancements

- [x] 2FA via email codes
- [x] `tokenVersion` support in controller (migration pending)
- [x] Brute-force limiter: `authLimiter.js`
- [ ] ❗ CSRF protection (for cookie-based auth)
- [ ] ❗ Email login/change notifications
- [ ] ⏳ Session audit (IP/user-agent logging)
- [ ] ⏳ Swagger or OpenAPI spec

### 🔁 TokenVersion Migration (Planned)

- [ ] Migration file creation for `tokenVersion` in User
- [ ] Apply migration and update `seedSuperAdmin`
- [ ] Remove `try/catch` fallback in `server.js`

### 🧪 Tests

- [x] `/auth`, `/reset-password`, `/webhook/square`
- [ ] ❗ Add tests for Favorites, Upload, Editable Pages (pagesController)

### 📘 Documentation

- [x] `api_documentation.md` present
- [ ] ❗ POST body examples still missing
- [ ] ❗ Server README lacks updated feature list

---
