
# 🛡️ Security Audit Summary — Cowboylogic Strategies / Publishing

📅 Date / Дата: 2025-06-06

---

## ✅ Main Security Mechanisms / Основні механізми безпеки

### 🔐 JWT Authentication / JWT-автентифікація

- Protected routes verify tokens via `protect` middleware.
- Token is extracted from the `Authorization` header.
- If the user is not found — request is rejected (401).
- On success, `req.user` includes `id`, `email`, `role`, `isSuperAdmin`.

---

### 🧠 Roles & Authorization / Ролі та авторизація

- Roles: `user`, `admin`, `superadmin` as defined in the `User` model.
- `isAdmin` and `isSuperAdmin` middlewares enforce access control.
- `requireRole([roles])` provides flexible multi-role checks.

---

### 🚫 Rate Limiting / Обмеження частоти запитів

- `POST /auth/login` is protected by `authLimiter.js` (10 attempts per 15 min).
- Prevents brute-force password guessing.

---

### 📝 Logging / Логування

- `protect` middleware logs user activity: email, role, method, and route.
- Critical superadmin actions are logged to `logs/superadmin.log`.

---

### 💳 Payment Verification — Square Webhook

- `webhookController.js` handles `/webhook/square`
- Signature validation ensures request integrity
- Matches event `payment.created` before fulfilling order

---

### 🖼 File Upload Protection

- `uploadMiddleware.js` restricts file uploads
- Checks: MIME type, file extension, filename sanitization
- Limits image uploads to safe formats (e.g., png, jpeg)

---

### 🛡 Summary / Висновок

The system adheres to core security practices:

- Authentication and user identity protection
- Brute-force protection via rate limiting
- Role-based access control
- Centralized logging for auditing
- Verified payment events via Square
- Secure file upload with MIME/type checks

---

## 🔧 Middleware Overview / Огляд middleware

| Name / Назва           | Description / Опис                                      |
|------------------------|----------------------------------------------------------|
| `protect`              | Verifies JWT / Перевіряє JWT                            |
| `isAdmin`              | Restricts to admin / Доступ для "admin"                 |
| `isSuperAdmin`         | Restricts to superadmin / Доступ для "superadmin"       |
| `requireRole([...])`   | Role validation / Перевірка ролей                       |
| `authLimiter`          | Rate-limit login / Обмеження спроб логіну               |
| `uploadMiddleware`     | Controls file uploads / Захист під час завантаження     |

---

## 📁 Superadmin Logging / Логування супер адміна

- Logs role changes, access to user management, deletions
- Path: `logs/superadmin.log`
