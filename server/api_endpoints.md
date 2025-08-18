# 📌 API Endpoints Reference

_Last updated: 2025-08-18_

---

## 📚 Books
- `GET /api/books` – retrieve list of books
- `GET /api/books/:id` – retrieve book details
- `POST /api/books` – create a book
- `PUT /api/books/:id` – update book information
- `DELETE /api/books/:id` – remove a book
- `GET /api/books/partner-books` – list partner books
- `POST /api/books/check-stock` – check stock availability

## 👤 Auth
- `POST /api/auth/register` – register a new user
- `POST /api/auth/login` – log in a user
- `POST /api/auth/logout` – log out current user
- `GET /api/auth/me` – get current user info
- `POST /api/auth/google` – authenticate via Google
- `POST /api/auth/request-code` – request login code
- `POST /api/auth/verify-code` – verify login code
- `PATCH /api/auth/reset-password` – reset password

## 👥 Users
- `GET /api/users` – list all users
- `PATCH /api/users/:id/role` – change user role
- `DELETE /api/users/:id` – delete a user

## 🙋‍♂️ Self
- `PATCH /api/me/avatar` – update own avatar

## 🛒 Cart
- `GET /api/cart` – get cart contents
- `POST /api/cart` – add item to cart
- `PATCH /api/cart/:itemId` – update item quantity
- `DELETE /api/cart/:itemId` – remove item from cart
- `DELETE /api/cart` – clear the cart

## 🧾 Orders
- `POST /api/orders` – create a new order
- `GET /api/orders` – get user's orders
- `GET /api/orders/all` – get all orders
- `PATCH /api/orders/:id/status` – update order status
- `DELETE /api/orders/:id` – delete an order
- `GET /api/orders/latest` – get latest order
- `POST /api/orders/confirm` – confirm Square order

## 📄 Pages
- `GET /api/pages/:slug` – get page by slug
- `GET /api/pages/:slug/versions` – get draft and published versions
- `PUT /api/pages/:slug/draft` – save draft content
- `PUT /api/pages/:slug` – publish page content
- `POST /api/pages` – create a page

## 📬 Contact
- `POST /api/contact` – send contact message

## 📢 Newsletter
- `POST /api/newsletter/subscribe` – subscribe to newsletter
- `POST /api/newsletter/send` – send newsletter

## 📦 Favorites
- `GET /api/favorites` – get favorite books
- `POST /api/favorites` – add a favorite book
- `DELETE /api/favorites/:bookId` – remove a favorite book

## 🔗 Webhooks
- `POST /api/webhook/square` – handle Square webhook events

## 💳 Square
- `POST /api/square/create-payment` – create payment link

## 🖼️ Images
- `POST /images/upload` – upload an image

## 🔎 Search
- `GET /api/search/search` – search books

