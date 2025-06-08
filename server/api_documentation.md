# 📘 API Documentation — Cowboylogic Strategies / Publishing

_Last updated: 2025-06-08

---

## 🌐 Base URL

- **Local**: `http://localhost:5000/api`
- **Production**: `http://clpit.duckdns.org:64660/api`

## ⭐ Favorites Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | - |
| POST | `/` | - |
| DELETE | `/:bookId` | - |

## 🌐 Webhooks Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/square` | - |

## 👥 Users Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | - |
| PATCH | `/:id/role` | - |
| DELETE | `/:id` | - |

## 💳 Square Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-payment` | - |

## 📄 Pages Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:slug` | - |
| GET | `/:slug/versions` | - |
| PUT | `/:slug/draft` | - |
| PUT | `/:slug` | - |

## 📚 Books Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | - |
| GET | `/:id` | - |
| DELETE | `/:id` | - |
| POST | `/` | - |
| PUT | `/` | - |

## 📢 Newsletter Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/subscribe` | - |
| POST | `/send` | - |

## 📦 Orders Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | - |
| GET | `/` | - |
| GET | `/all` | - |
| PATCH | `/:id/status` | - |
| DELETE | `/:id` | - |
| GET | `/latest` | - |
| POST | `/create-checkout-session` | - |
| POST | `/confirm-stripe-order` | - |

## 📬 Contact Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | - |

## 🔐 Auth Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | - |
| POST | `/` | - |
| POST | `/logout` | - |
| GET | `/me` | - |
| POST | `/google` | - |
| POST | `/request-code` | - |
| POST | `/verify-code` | - |
| PATCH | `/reset-password` | - |

## 🖼️ Images Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | - |

## 🛒 Cart Endpoints (`/api/...`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | - |
| POST | `/` | - |
| PATCH | `/:itemId` | - |
| DELETE | `/:itemId` | - |
| DELETE | `/` | - |
