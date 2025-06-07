
# 🛠 Backend TODO — CowboyLogic / Тудушник для бекенду

## ✅ Основні факти / Key Facts

- ✅ Додано: функціонал "Обране" (Favorites)
- ✅ Додано: Square Controller (інтеграція оплати)
- ✅ Додано: Reset Password Controller
- ✅ Додано: Upload Middleware
- ✅ Додано: `Favorite` модель + API
- ✅ Додано: `resetPasswordController.js`, `uploadMiddleware.js`
- ✅ Присутні файли-картинки у `public/uploads`

---

## 🔒 Security Enhancements / Покращення безпеки

- [ ] ✅ MIME-type перевірка у `uploadMiddleware.js`
- [ ] ✅ Розмір та розширення файлу при upload
- [ ] [опц] CSRF protection (якщо cookies)
- [ ] [опц] Email-нотифікація при логіні або зміні пароля
- [ ] [опц] Аудит сесій (лог IP, user-agent, timestamp)

---

## 🔑 JWT & Tokens

- [ ] ➕ Реалізувати `tokenVersion` migration (див. окремий файл)
- [ ] 🔁 Додати підтримку Refresh Token Flow

---

## 🧪 Testing / Тестування

- [ ] ✅ Auth (login / register / 2FA)
- [ ] ✅ resetPassword endpoint
- [ ] ✅ Square Webhook handler
- [ ] ✅ protect / requireRole middleware
- [ ] ✅ Pages (GET / PUT)
- [ ] ➕ Favorite controller endpoints
- [ ] ➕ Upload middleware

---

## 📘 Документація / Documentation

- [ ] ➕ Додати приклади запитів до всіх POST (у `api_documentation.md`)
- [ ] [опц] Додати Swagger або OpenAPI
- [ ] ➕ Оновити README (сервер), додати info про Square, Upload, Favorites

---

## 🌍 Інтернаціоналізація

- [ ] [опц] Email-шаблони на 2х мовах (en / ua)

---

_Last updated: 2025-06-06_
