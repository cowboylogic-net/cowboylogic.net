# 🛠 Backend Tasks — CowboyLogic (2025-06-08)

## 🇺🇸 English

This checklist summarizes all remaining backend work based on current implementation.

## 🇺🇦 Українською

Цей список підсумовує всі завдання, які залишилися для серверної частини на основі реалізованого функціоналу.

## ✅ Implemented / Реалізовано
- [x] Auth (login, Google, 2FA, token validation)
- [x] Role middleware (`protect`, `isAdmin`, `isSuperAdmin`, `requireRole`)
- [x] Favorites (CRUD)
- [x] Orders (create, get, delete, status)
- [x] Pages (GET, PUT, draft, versions)
- [x] Upload middleware (images only, with validation)
- [x] Contact, Newsletter, Webhook (Square)
- [x] User management (CRUD, role updates)
- [x] Logging for superadmin actions
- [x] Validation with Joi for major endpoints

## 🔁 To Do / Що потрібно зробити

### 🔒 Security / Безпека
- [ ] Add CSRF protection (if using cookies in future)
- [ ] Add login IP/user-agent logging (session audit)
- [ ] Email notification on login or password change (optional)
- [ ] Refresh token support (separate endpoint + logic)
- [ ] Add global error response formatting (standard JSON with status/code)

### 🔐 Auth & Tokens
- [ ] Finalize `tokenVersion` migration in database
- [ ] Implement refresh token endpoint + reissue logic
- [ ] Revoke all sessions on password reset via `tokenVersion++`

### 📄 Pages / Контент
- [ ] Auto-create page if not found on PUT (currently 404)
- [ ] Add scheduled cleanup for old draft versions (optional)

### 🧪 Testing
- [ ] Unit tests for: uploadMiddleware, pagesController, favoriteController
- [ ] Integration tests with mock auth for protected endpoints
- [ ] Test for webhook signature verification (Square)

### 📝 Docs
- [ ] Add sample payloads to `api_documentation.md` (especially POST)
- [ ] Add Swagger/OpenAPI spec (optional)
- [ ] Document `resetPassword`, `verify-code`, `request-code` usage clearly

### 🧩 Misc
- [ ] Move square logic to `services/squareService.js` cleanly
- [ ] Add `logger.js` entries to more critical routes (orders, auth)
- [ ] Implement generic `validateIdParam()` for routes with `:id`
- [ ] Add global response helpers (res.success / res.error)