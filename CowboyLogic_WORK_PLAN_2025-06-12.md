# 🗓️ CowboyLogic – Work Plan (Updated after 2025-06-12)

## ✅ Assumptions
- Form validation (Reset, Register, AddBook, EditBook, Newsletter) is **complete**.
- Client and server ZIPs are analyzed.
- Editable Pages autosave is working and complete.
- You want a structured plan to finish and deploy everything.

---

## 📆 Daily Focus Plan

### 🟩 Day 1: Internationalization (i18n)
- [ ] Translate:
  - Navbar
  - Footer
  - AdminDashboard
  - FavoritesPage
  - All modals: ConfirmModal, ImageInsertModal, etc.
- [ ] Add `t()` support to Notification messages and form errors

### 🟩 Day 2: Finalizing Editable Pages
- [ ] Confirm all modals are i18n-ready
- [ ] Confirm autosave with debounce and dirty check
- [ ] Polish rendering after draft save/cancel

### 🟩 Day 3: UI/UX Enhancements
- [ ] Fix hover states for buttons and links
- [ ] Add `alt` tags to all images
- [ ] Improve mobile responsiveness of modals
- [ ] Add 404 fallback page
- [ ] Add lazy loading for BookDetails and Orders
- [ ] Add `react-helmet` for SEO

### 🟩 Day 4: TokenVersion Migration
- [ ] Create Sequelize migration for `tokenVersion` field
- [ ] Update `seedSuperAdmin.js`
- [ ] Remove try/catch from `server.js` around seed logic

### 🟩 Day 5: Backend Testing
- [ ] Add tests for:
  - Favorites controller
  - Upload middleware
  - Pages controller (`GET`, `PUT`, `draft`)
- [ ] Verify protected routes and roles via Postman

### 🟩 Day 6: API Docs & Swagger
- [ ] Add Swagger/OpenAPI spec or export Postman Collection
- [ ] Add POST body examples to `api_documentation.md`

### 🟩 Day 7: Final Documentation
- [ ] Update `README.md` (server and client if needed)
- [ ] Create `INTEGRATION_GUIDE.md`
- [ ] Create `DEV_GUIDE.md` (how to run, test, deploy)
- [ ] Sync roles & permissions from `roles_and_permissions.md`

---

## 🛠️ Extra (Optional After Day 7)
- [ ] Implement session auditing (log IP/user-agent)
- [ ] Email notifications on login/password change
- [ ] CSRF protection (if using cookies)