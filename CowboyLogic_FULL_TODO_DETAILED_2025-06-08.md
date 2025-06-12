
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

### 🧩 FRONTEND TODO (Detailed)

#### 🔐 Authentication

- [x] Login + 2FA (`LoginForm.jsx`, `authThunks.js`)
- [x] Google Login (`/auth/google`)
- [x] Role-based routing (`AdminRoute.jsx`, `PrivateRoute.jsx`)
- [ ] ⏳ Form validation (partial)
  - [x] `ResetPasswordForm` — implemented (Yup)
  - [x] `RegisterForm` — implemented (Yup)
  - [x] `AddBook` — missing
  - [x] `EditBook` — missing
  - [x] `Newsletter` — missing

#### 🌍 i18n

- [x] LoginForm and LanguageSwitcher implemented
- [x] `i18n.js` + locales/en + locales/es present
- [ ] ❗ Translate Footer, Navbar, Cart, FavoritesPage, AdminDashboard
- [ ] ❗ Translate all modals: `ConfirmModal`, `ImageInsertModal`, etc.
- [ ] ❗ Add i18n to Notification system and form errors

#### 📦 Redux

- [x] All slices present
- [x] All thunks present
- [x] ✅ Error handling added to all thunks (try/catch)

#### ✍️ Editable Pages

- [x] EditablePage with working toolbar
- [x] Modals for image, link, confirm
- [x] `/pages/:slug`, `/draft`, `/versions` support
- [x] Autosave implemented via `debounce` + `saveDraft`
- [x] Improve autosave: debounce + isDirty check implemented
- [x] Confirm before HTML insert — **skipped by design (UX decision)**
- [x] Draft rendering preview polished: correct cursor handling on return from preview
- [ ] Fix bugs: Oleg

#### 💳 Payments

- [x] Square logic implemented (`create-checkout-session`)
- [x] SuccessPage, CancelPage
- [ ] ❗ Show spinner during payment
- [ ] ❗ Clear cart on payment success

#### 📱 UI/UX

- [ ] Improve mobile modals
- [ ] Fix hover states on links, navbar, buttons
- [ ] Add alt-text to all `<img>`
- [ ] Add react-helmet
- [ ] Add 404 fallback
- [ ] Lazy load Orders, BookDetails

#### 🧪 Testing

- [ ] Add Vitest or RTL
- [ ] Unit tests for Redux slices
- [ ] Snapshot tests for BookList, EditablePage

## 🛠 BACKEND TODO (Detailed)

### ✅ Implemented

- [x] Favorite controller + routes + model
- [x] resetPasswordController.js
- [x] Square integration: squareController.js + webhook
- [x] Upload via uploadMiddleware.js with MIME/type check
- [x] Role-based middleware: protect, requireRole, isAdmin, isSuperAdmin

### 🔐 Security Enhancements

- [x] 2FA via email codes
- [x] tokenVersion support in controller (migration pending)
- [x] Brute-force limiter: authLimiter.js
- [ ] ❗ CSRF protection (for cookie-based auth)
- [ ] ❗ Email login/change notifications
- [ ] ⏳ Session audit (IP/user-agent logging)
- [ ] ⏳ Swagger or OpenAPI spec

### 📚 Store Features

- [ ] ✅ Implement pagination for BookList / магазин
- [ ] ✅ Optimize uploaded images (resize, compress before upload)
- [ ] ✅ Add history of user orders (`GET /orders` by user ID)

### 🔁 TokenVersion Migration (Planned)

- [ ] Migration file creation for tokenVersion in User
- [ ] Apply migration and update seedSuperAdmin
- [ ] Remove try/catch fallback in server.js

### 🧪 Tests

- [x] /auth, /reset-password, /webhook/square
- [ ] ❗ Add tests for Favorites, Upload, Editable Pages (pagesController)

### 📘 Documentation

- [x] api_documentation.md present
- [ ] ❗ POST body examples still missing
- [ ] ❗ Server README lacks updated feature list

---
