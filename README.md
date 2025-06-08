# 🐎 CowboyLogic Strategies / Publishing

## 🇺🇸 English

CowboyLogic is a full-stack publishing and strategy platform for local authors and business thinkers. It supports secure login, role-based permissions, book publishing, dynamic editable pages, and payment processing.

## 🇺🇦 Українською

CowboyLogic — це повноцінна платформа для публікацій та стратегій місцевих авторів і підприємців. Підтримує безпечну авторизацію, розподіл прав доступу, публікацію книг, редаговані сторінки та оплату.

---

## 🔧 Tech Stack / Технології
- Frontend: React + Vite + Redux Toolkit + i18n
- Backend: Node.js + Express + Sequelize + MySQL
- Auth: JWT + 2FA + Google
- Payment: Square API

## 📚 Features / Функціональність
- 🔐 Authentication with email, Google, 2FA
- 📚 Book management (CRUD) for admins
- 🛒 Shopping cart & orders
- 💳 Payment integration (Square)
- ✍️ Editable content pages with draft & image upload
- 🧩 Favorites, Notifications, Role control
- 🌍 Multilingual interface (EN / ES)
- 📬 Newsletter & contact form
- 📦 RESTful API with JWT middleware

## 🛡 Security / Безпека
- Token versioning & logout everywhere
- Rate limiting, upload sanitization, role-based access
- SuperAdmin activity logging

## 🚀 Deployment / Деплой
- `.env.example` provided
- Works with Vercel, Railway, Docker or custom VPS

## 🧪 Getting Started / Початок роботи

### 🖥 Backend
```bash
cd server
cp .env.example .env       # configure your DB, JWT, etc.
npm install
npx sequelize-cli db:migrate
npm run seed               # optional: create SuperAdmin
npm run dev                # or use pm2
```

### 💻 Frontend
```bash
cd client
npm install
npm run dev
```

### 🌍 Environment / Змінні середовища
- FRONTEND: see `client/.env` or `vite.config.js`
- BACKEND: set JWT_SECRET, DB credentials, 2FA config, Square keys

### ✅ Testing
- Unit tests planned with Vitest / React Testing Library (frontend)
- For backend: Jest or integration tests (Postman, etc.)

### 🌐 Deployment Notes / Розгортання
- Use Vercel for frontend (static hosting + SPA)
- Use Railway / Docker / VPS for backend
- Don't push `.env` to repo!
- On Vercel: set env variables via dashboard