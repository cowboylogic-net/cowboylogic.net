# 🆕 Postman Testing Checklist — NEW Features (CowboyLogic, Post-2025-06-08)

## 🔐 Security Features & Enhancements
- [ ] `POST /api/auth/login` — Confirm `authLimiter` works (rate limiting after 10 tries)
- [ ] Test JWT token expiration + `tokenVersion` reset effect
- [ ] Session audit: check if logging (IP, user-agent) is activated
- [ ] Email login notification (if enabled)

## 🔁 Token Version Migration (after DB migration)
- [ ] Check if `tokenVersion` exists in `/api/auth/me` response
- [ ] Change password → verify forced logout (token becomes invalid)

## 📄 Editable Pages — Enhanced
- [ ] `PUT /api/pages/:slug/draft` — Check auto-draft save flow
- [ ] Cancel edit → ensure `publishedContent` is restored
- [ ] `GET /api/pages/:slug/versions` — Check multiple versions saved
- [ ] Test with malformed HTML → sanitize

## 🖼 Image Upload Security
- [ ] `POST /api/upload` — Upload PNG (✅ valid)
- [ ] `POST /api/upload` — Upload .exe (❌ must fail)
- [ ] `POST /api/upload` — Oversized file (❌ must fail)
- [ ] `POST /api/upload` — Upload with suspicious filename

## 💳 Square Webhook
- [ ] Simulate `payment.created` event with valid Square signature
- [ ] Simulate event with **invalid** signature → must be rejected
- [ ] Missing event data → must return 400

## 🗂 Role Protection & Logic
- [ ] `DELETE /api/users/:id` — Ensure SuperAdmin cannot be deleted
- [ ] `PATCH /api/users/:id/role` — Ensure only SuperAdmin can change roles
- [ ] `GET /api/users` — Block for non-superadmin

## 📘 API Docs Validity
- [ ] Compare every endpoint with `/api_documentation.md` + `api_endpoints.md`
- [ ] Test undocumented route call (should return 404 or block)

## 🌍 I18n & Errors
- [ ] Wrong language param in headers → default to `en`
- [ ] Confirm error messages are localized
- [ ] Simulate validation errors (form) and check i18n fields