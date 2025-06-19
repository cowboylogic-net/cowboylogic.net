# 🧩 CowboyLogic: Unified REST API Structure & Postman Testing Checklist

_Last updated: 2025-06-12

---

## ⚙️ RESTful API Structure

### 1. `/api/strategy` — Educational Programs

#### 🔸 Cowboy College Start-up

- [ ] `GET /strategy/startups` — List all startup programs
- [ ] `POST /strategy/startups` — Create a new startup program
- [ ] `GET /strategy/startups/:id` — Get details of a startup program
- [ ] `PUT /strategy/startups/:id` — Update a startup program
- [ ] `DELETE /strategy/startups/:id` — Delete a startup program

#### 🔸 Cowboy College Consulting

- [ ] `GET /strategy/consulting` — List consulting sessions
- [ ] `POST /strategy/consulting` — Create a new consulting session

#### 🔸 Cowboy College Leadership

- [ ] `GET /strategy/leadership` — List leadership classes
- [ ] `POST /strategy/leadership` — Create a new leadership class

> 🔄 Optionally unify via: `/strategy/programs?type=startup|consulting|leadership`

---

### 2. `/api/publishing` — Publishing System

#### 🔸 Books

- [ ] `GET /publishing/books`
- [ ] `GET /publishing/books/:id`
- [ ] `POST /publishing/books`
- [ ] `PUT /publishing/books/:id`
- [ ] `DELETE /publishing/books/:id`

#### 🔸 Authors

- [ ] `GET /publishing/authors`
- [ ] `GET /publishing/authors/:id`
- [ ] `POST /publishing/authors`
- [ ] `PUT /publishing/authors/:id`
- [ ] `DELETE /publishing/authors/:id`

#### 🔸 Readers

- [ ] `GET /publishing/readers`
- [ ] `GET /publishing/readers/:id`
- [ ] `POST /publishing/readers/:id/review`

#### 🔸 B2B Bookstores

- [ ] `GET /publishing/bookstores`
- [ ] `POST /publishing/bookstores`
- [ ] `PUT /publishing/bookstores/:id`

---

### 3. `/api/users` — User & Role Management

#### 🔸 Users

- [ ] `GET /users`
- [ ] `GET /users/:id`
- [ ] `POST /users`
- [ ] `PUT /users/:id`
- [ ] `DELETE /users/:id`

#### 🔸 Roles & Groups

- [ ] `GET /users/roles`
- [ ] `PUT /users/:id/role`
- [ ] `GET /groups`
- [ ] `POST /groups`
- [ ] `PUT /groups/:id`

---

### 4. `/api/profiles` — User Profiles

- [ ] `GET /profiles/:id`
- [ ] `PUT /profiles/:id`
- [ ] `POST /profiles/avatar`

---

## ✅ Postman Testing Checklist

### 🔐 Authentication

- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/login`
- [ ] `POST /api/auth/google`
- [ ] `POST /api/auth/request-code`
- [ ] `POST /api/auth/verify-code`
- [ ] `GET /api/auth/me`
- [ ] `PATCH /api/auth/reset-password`
- [ ] `POST /api/auth/logout`

### 👥 Users

- [ ] `GET /api/users`
- [ ] `PATCH /api/users/:id/role`
- [ ] `DELETE /api/users/:id`

### 📚 Books

- [ ] `GET /api/books`
- [ ] `GET /api/books/:id`
- [ ] `POST /api/books`
- [ ] `PUT /api/books`
- [ ] `DELETE /api/books/:id`

### ⭐ Favorites

- [ ] `GET /api/favorites`
- [ ] `POST /api/favorites`
- [ ] `DELETE /api/favorites/:bookId`

### 📦 Orders

- [ ] `GET /api/orders`
- [ ] `GET /api/orders/all`
- [ ] `GET /api/orders/latest`
- [ ] `POST /api/orders`
- [ ] `PATCH /api/orders/:id/status`
- [ ] `DELETE /api/orders/:id`
- [ ] `POST /api/orders/create-checkout-session`
- [ ] `POST /api/orders/confirm-stripe-order`

### 🛒 Cart

- [ ] `GET /api/cart`
- [ ] `POST /api/cart`
- [ ] `PATCH /api/cart/:itemId`
- [ ] `DELETE /api/cart/:itemId`
- [ ] `DELETE /api/cart`

### 📄 Pages

- [ ] `GET /api/pages/:slug`
- [ ] `PUT /api/pages/:slug`
- [ ] `PUT /api/pages/:slug/draft`
- [ ] `GET /api/pages/:slug/versions`

### 📬 Contact

- [ ] `POST /api/contact`

### 📢 Newsletter

- [ ] `POST /api/subscribe`
- [ ] `POST /api/send`

### 🖼 Uploads

- [ ] `POST /api/upload`

### 🌐 Webhooks

- [ ] `POST /api/webhook/square`
