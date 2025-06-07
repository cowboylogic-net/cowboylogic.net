
# 🧠 CowboyLogic Full Project README / Повна документація проєкту CowboyLogic

## 📘 Опис / Description

**🇺🇸 English:**  
CowboyLogic is a bilingual full-stack web platform for showcasing and selling books by local authors. It also offers editable content pages, consulting service promotion, secure login with 2FA, Square payments, and role-based access for users, admins, and superadmins.

**🇺🇦 Українською:**  
CowboyLogic — це двомовна повноцінна веб-платформа для демонстрації й продажу книг місцевих авторів. Платформа також дозволяє редагувати контент сторінок, просувати консультаційні послуги, підтримує захищений вхід з 2FA, оплату через Square та контроль доступу за ролями (юзер, адмін, супер-адмін).

---

## 🛠 Технології / Tech Stack

- **Frontend:** React + Vite + Redux Toolkit
- **Backend:** Node.js + Express
- **Database:** MySQL + Sequelize ORM
- **Security:** JWT, 2FA (email), rate-limiting, role-based access, upload validation
- **Payment Integration:** Square Webhooks
- **UI/UX:** Editable content, WYSIWYG editor, modals, multilingual (en, es)

---

## 🔐 Аутентифікація та Ролі / Authentication & Roles

- Email/Password login + optional 2FA (email code)
- Google login (OAuth)
- Role hierarchy:
  - `user`: standard features (view, cart, order)
  - `admin`: manage content (books, pages, newsletters)
  - `superadmin`: manage users, assign roles, audit logs

---

## 📦 Основний функціонал / Key Features

- 📚 Book Management (CRUD, image upload)
- 🛒 Shopping Cart & Orders
- 💳 Square Payment Integration
- ✍️ Editable Pages (WYSIWYG)
- 🌍 Multilingual (English, Spanish)
- 🧩 Redux Global State
- 🔔 Notifications + Modals + Validation

---

## 🧩 Структура проєкту / Project Structure

**Backend:**  
See → [server_structure_FULL_FACTUAL.txt](./server_structure_FULL_FACTUAL.txt)

**Frontend:**  
See → [frontend_structure_FULL_FACTUAL.txt](./frontend_structure_FULL_FACTUAL.txt)

---

## ✅ Завершено / Completed

- [x] REST API with validation and error handling
- [x] Auth + 2FA + Role control
- [x] Newsletter system
- [x] Editable pages with image modals
- [x] Favorites system
- [x] Square Webhook integration
- [x] Admin dashboard
- [x] Security audit + protection

---

## 🔜 У розробці / In Progress

- [ ] Vitest / RTL тестування (Front)
- [ ] Swagger / OpenAPI (Back)
- [ ] Мультимовність на всіх сторінках
- [ ] Повідомлення після оплати (SuccessPage)
- [ ] CSRF + Audit logs + Upload security

---

_Last updated: 2025-06-06_
