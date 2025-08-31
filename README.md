
# 📘 CowboyLogic — Fullstack Web Platform (Detailed Overview)

_Last updated: 2025-06-08

CowboyLogic is a full-featured bilingual (EN/UA) publishing and strategy platform built with a modern tech stack

- **Frontend:** React + Vite + Redux Toolkit + i18n
- **Backend:** Node.js + Express + Sequelize + MySQL
- **Deployment:** HostGator (Frontend), Physical Server with DuckDNS (Backend)
- **Security:** JWT, 2FA, role-based access, input validation, upload security

---

## 🚀 Features

### 🔐 Authentication & Authorization

- JWT-based login with 2FA (email code)
- Google OAuth login supported
- Role-based routing: `user`, `admin`, `superadmin`
- Middleware protection: `protect`, `isAdmin`, `isSuperAdmin`, `requireRole`

### 📚 Bookstore

- Browse, add, edit, and delete books (admin only)
- Favorites system: `GET/POST/DELETE /api/favorites`
- Book rating feature (planned)

### 🛒 Cart & Checkout

- Add/remove items from cart
- Integrated Square payment
- Success and Cancel pages
- Orders stored and accessible by users/admins

### ✍️ Editable Pages

- Admins can edit static pages via WYSIWYG editor
- Supports bold/italic, tables, links, and image uploads
- Version history, draft saving, and HTML confirmation modals

### 📬 Newsletter & Contact

- Newsletter signup and admin-only sending
- Contact form with email forwarding
- Subscriptions stored in DB

### 🧪 Testing (Planned)

- Unit tests (Redux slices)
- Snapshot tests
- API route testing

---

## 🛡 Security Architecture

- **JWT + Middleware:** Protects all private routes
- **Brute-force protection:** Rate limiter on login
- **2FA:** Code via email with expiration
- **SuperAdmin:** Cannot be deleted or modified by others
- **Upload protection:** MIME type, extension, filename sanitation
- **Webhook validation:** Square signature check on `/webhook/square`

---

## 🧩 Tech Stack

| Layer         | Technology                         |
|---------------|-------------------------------------|
| Frontend      | React, Vite, Redux Toolkit          |
| Styling       | CSS Modules, custom themes          |
| i18n          | react-i18next                       |
| State         | Redux Toolkit (slices + thunks)     |
| Backend       | Node.js, Express                    |
| ORM           | Sequelize                           |
| Database      | MySQL                               |
| Auth          | JWT, 2FA (email codes)              |
| Payment       | Square Checkout API                 |
| Hosting       | HostGator (Frontend), VPS (Backend) |
| CI/CD         | Jenkins + PM2                       |

---

## 📦 Folder Structure (Mono-Repo)

cowboylogic.net/
├── client/               # React frontend
│   ├── src/components/   # Modular components
│   ├── src/pages/        # Route pages
│   ├── src/store/        # Redux logic
├── server/               # Express backend
│   ├── controllers/      # Route logic
│   ├── models/           # Sequelize models
│   ├── routes/           # API routing
│   ├── middleware/       # Custom middleware
│   ├── services/         # Email/Square integrations

---

## 👥 Roles & Permissions

| Role        | Permissions Summary |
|-------------|---------------------|
| **User**    | View books, manage cart, place orders, edit profile |
| **Partner** |  |
| **Admin**   | Manage content, books, orders, newsletters |
| **SuperAdmin** | Full control including user management and protected deletion |

---

## 🧠 Developer Tips

- Environment variables must be configured via `.env` (not committed)
- Use `vite` for frontend dev and `nodemon` / `pm2` for backend dev/prod
- Database schema changes should be done via Sequelize CLI (migrations)
- For i18n: avoid hardcoded strings; use `t("key")` and proper locale files

---

CowboyLogic is under active development and gradually approaching production stability. Contributions and code reviews welcome.
