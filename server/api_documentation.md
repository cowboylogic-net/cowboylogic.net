# 📘 API Documentation — Cowboylogic Strategies / Publishing

_Last updated: 2025-08-19

---

## 🌐 Base URL

- **Local**: `http://localhost:5000`
- **Production**: `http://clpit.duckdns.org:64660`

---

## 📚 Books

### GET /api/books

- **Description:** Retrieve list of books.
- **Request Body:** None
- **Response:**

    ```json
    [
    { "id": "1", "title": "Example Book" }
    ]
    ```

- **Errors:** 500 Internal Server Error

### GET /api/books/:id

- **Description:** Retrieve book details.
- **Request Body:** None
- **Response:**

    ```json
    { "id": "1", "title": "Example Book", "author": "Author" }
    ```

- **Errors:** 404 Not Found, 500 Internal Server Error

### POST /api/books

- **Description:** Create a book.
- **Request Body:**

    ```json
    { "title": "New Book", "author": "Author" }
    ```

- **Response:**

    ```json
    { "id": "2", "title": "New Book", "author": "Author" }
    ```

- **Errors:** 400 Bad Request, 401 Unauthorized

### PUT /api/books/:id

- **Description:** Update book information.
- **Request Body:**

    ```json
    { "title": "Updated Title" }
    ```

- **Response:**

    ```json
    { "id": "1", "title": "Updated Title" }
    ```

- **Errors:** 400 Bad Request, 401 Unauthorized, 404 Not Found

### DELETE /api/books/:id

- **Description:** Remove a book.
- **Request Body:** None
- **Response:**

    ```json
    { "message": "Book deleted" }
    ```

- **Errors:** 401 Unauthorized, 404 Not Found

### GET /api/books/partner-books

- **Description:** List partner books.
- **Request Body:** None
- **Response:**

    ```json
    [
    { "id": "p1", "title": "Partner Book" }
    ]
    ```

- **Errors:** 500 Internal Server Error

### POST /api/books/check-stock

- **Description:** Check stock availability.
- **Request Body:**

    ```json
    { "bookId": "1" }
    ```

- **Response:**

    ```json
    { "bookId": "1", "inStock": true }
    ```

- **Errors:** 400 Bad Request, 404 Not Found

---

## 👤 Auth

### POST /api/auth/register

- **Description:** Register a new user.
- **Request Body:**

    ```json
    { "email": "user@example.com", "password": "secret" }
    ```

- **Response:**

    ```json
    { "id": "u1", "email": "user@example.com" }
    ```

- **Errors:** 400 Bad Request, 409 Conflict

### POST /api/auth/login

- **Description:** Log in a user.
- **Request Body:**

    ```json
    { "email": "user@example.com", "password": "secret" }
    ```

- **Response:**

    ```json
    { "token": "jwt-token" }
    ```

- **Errors:** 400 Bad Request, 401 Unauthorized

### POST /api/auth/logout

- **Description:** Log out current user.
- **Request Body:** None
- **Response:**

    ```json
    { "message": "Logged out" }
    ```

- **Errors:** 401 Unauthorized

### GET /api/auth/me

- **Description:** Get current user info.
- **Request Body:** None
- **Response:**

    ```json
    { "id": "u1", "email": "user@example.com" }
    ```

- **Errors:** 401 Unauthorized

### POST /api/auth/google

- **Description:** Authenticate via Google.
- **Request Body:**

    ```json
    { "idToken": "google-id-token" }
    ```

- **Response:**

    ```json
    { "token": "jwt-token" }
    ```

- **Errors:** 400 Bad Request, 401 Unauthorized

### POST /api/auth/request-code

- **Description:** Request login code.
- **Request Body:**

    ```json
    { "email": "user@example.com" }
    ```

- **Response:**

    ```json
    { "message": "Code sent" }
    ```

- **Errors:** 400 Bad Request

### POST /api/auth/verify-code

- **Description:** Verify login code.
- **Request Body:**

    ```json
    { "email": "user@example.com", "code": "123456" }
    ```

- **Response:**

    ```json
    { "token": "jwt-token" }
    ```

- **Errors:** 400 Bad Request, 401 Unauthorized

### PATCH /api/auth/reset-password

- **Description:** Reset password.
- **Request Body:**

```json
{ "token": "reset-token", "newPassword": "newSecret" }
```

- **Response:**

```json
{ "message": "Password updated" }
```

- **Errors:** 400 Bad Request, 401 Unauthorized

---

## 👥 Users

### GET /api/users

- **Description:** List all users.
- **Request Body:** None
- **Response:**

```json
[
  { "id": "u1", "email": "user@example.com" }
]
```

- **Errors:** 401 Unauthorized

### PATCH /api/users/:id/role

- **Description:** Change user role.
- **Request Body:**

```json
{ "role": "admin" }
```

- **Response:**

```json
{ "id": "u1", "role": "admin" }
```

- **Errors:** 400 Bad Request, 401 Unauthorized, 404 Not Found

### DELETE /api/users/:id

- **Description:** Delete a user.
- **Request Body:** None
- **Response:**

```json
{ "message": "User deleted" }
```

- **Errors:** 401 Unauthorized, 404 Not Found

---

## 🙋‍♂️ Self

### PATCH /api/me/avatar

- **Description:** Update own avatar.
- **Request Body:**

```json
{ "avatarUrl": "https://example.com/avatar.png" }
```

- **Response:**

```json
{ "id": "u1", "avatarUrl": "https://example.com/avatar.png" }
```

- **Errors:** 400 Bad Request, 401 Unauthorized

---

## 🛒 Cart

### GET /api/cart

- **Description:** Get cart contents.
- **Request Body:** None
- **Response:**

```json
{
  "items": [
    { "id": "b1", "quantity": 1 }
  ]
}
```

- **Errors:** 401 Unauthorized

### POST /api/cart

- **Description:** Add item to cart.
- **Request Body:**

```json
{ "bookId": "b1", "quantity": 1 }
```

- **Response:**

```json
{ "items": [ { "id": "b1", "quantity": 1 } ] }
```

- **Errors:** 400 Bad Request, 401 Unauthorized

### PATCH /api/cart/:itemId

- **Description:** Update item quantity.
- **Request Body:**

```json
{ "quantity": 2 }
```

- **Response:**

```json
{ "id": "b1", "quantity": 2 }
```

- **Errors:** 400 Bad Request, 401 Unauthorized, 404 Not Found

### DELETE /api/cart/:itemId

- **Description:** Remove item from cart.
- **Request Body:** None
- **Response:**

```json
{ "message": "Item removed" }
```

- **Errors:** 401 Unauthorized, 404 Not Found

### DELETE /api/cart

- **Description:** Clear the cart.
- **Request Body:** None
- **Response:**

```json
{ "message": "Cart cleared" }
```

- **Errors:** 401 Unauthorized

---

## 🧾 Orders

### POST /api/orders

- **Description:** Create a new order.
- **Request Body:**

```json
{ "items": [ { "bookId": "b1", "quantity": 1 } ] }
```

- **Response:**

```json
{ "id": "o1", "status": "pending" }
```

- **Errors:** 400 Bad Request, 401 Unauthorized

### GET /api/orders

- **Description:** Get user's orders.
- **Request Body:** None
- **Response:**

```json
[
  { "id": "o1", "status": "pending" }
]
```

- **Errors:** 401 Unauthorized

### GET /api/orders/all

- **Description:** Get all orders.
- **Request Body:** None
- **Response:**

```json
[
  { "id": "o1", "status": "pending" }
]
```

- **Errors:** 401 Unauthorized

### PATCH /api/orders/:id/status

- **Description:** Update order status.
- **Request Body:**

```json
{ "status": "shipped" }
```

- **Response:**

```json
{ "id": "o1", "status": "shipped" }
```

- **Errors:** 400 Bad Request, 401 Unauthorized, 404 Not Found

### DELETE /api/orders/:id

- **Description:** Delete an order.
- **Request Body:** None
- **Response:**

```json
{ "message": "Order deleted" }
```

- **Errors:** 401 Unauthorized, 404 Not Found

### GET /api/orders/latest

- **Description:** Get latest order.
- **Request Body:** None
- **Response:**

```json
{ "id": "o1", "status": "pending" }
```

- **Errors:** 401 Unauthorized, 404 Not Found

### POST /api/orders/confirm

- **Description:** Confirm Square order.
- **Request Body:**

```json
{ "orderId": "o1", "paymentId": "p1" }
```

- **Response:**

```json
{ "id": "o1", "status": "confirmed" }
```

- **Errors:** 400 Bad Request, 401 Unauthorized

---

## 📄 Pages

### GET /api/pages/:slug

- **Description:** Get page by slug.
- **Request Body:** None
- **Response:**

```json
{ "slug": "about", "content": "..." }
```

- **Errors:** 404 Not Found

### GET /api/pages/:slug/versions

- **Description:** Get draft and published versions.
- **Request Body:** None
- **Response:**

```json
{ "draft": "draft content", "published": "published content" }
```

- **Errors:** 404 Not Found, 401 Unauthorized

### PUT /api/pages/:slug/draft

- **Description:** Save draft content.
- **Request Body:**

```json
{ "content": "draft content" }
```

- **Response:**

```json
{ "slug": "about", "content": "draft content" }
```

- **Errors:** 400 Bad Request, 401 Unauthorized

### PUT /api/pages/:slug

- **Description:** Publish page content.
- **Request Body:**

```json
{ "content": "final content" }
```

- **Response:**

```json
{ "slug": "about", "content": "final content" }
```

- **Errors:** 400 Bad Request, 401 Unauthorized

### POST /api/pages

- **Description:** Create a page.
- **Request Body:**

```json
{ "slug": "about", "content": "..." }
```

- **Response:**

```json
{ "slug": "about", "content": "..." }
```

- **Errors:** 400 Bad Request, 401 Unauthorized

---

## 📬 Contact

### POST /api/contact

- **Description:** Send contact message.
- **Request Body:**

```json
{ "name": "John", "email": "john@example.com", "message": "Hi" }
```

- **Response:**

```json
{ "message": "Contact message sent" }
```

- **Errors:** 400 Bad Request

---

## 📢 Newsletter

### POST /api/newsletter/subscribe

- **Description:** Subscribe to newsletter.
- **Request Body:**

```json
{ "email": "user@example.com" }
```

- **Response:**

```json
{ "message": "Subscribed" }
```

- **Errors:** 400 Bad Request

### POST /api/newsletter/send

- **Description:** Send newsletter.
- **Request Body:**

```json
{ "subject": "Hello", "content": "Newsletter body" }
```

- **Response:**

```json
{ "message": "Newsletter sent" }
```

- **Errors:** 400 Bad Request, 401 Unauthorized

---

## 📦 Favorites

### GET /api/favorites

- **Description:** Get favorite books.
- **Request Body:** None
- **Response:**

```json
[
  { "id": "b1", "title": "Book" }
]
```

- **Errors:** 401 Unauthorized

### POST /api/favorites

- **Description:** Add a favorite book.
- **Request Body:**

```json
{ "bookId": "b1" }
```

- **Response:**

```json
{ "id": "b1", "title": "Book" }
```

- **Errors:** 400 Bad Request, 401 Unauthorized

### DELETE /api/favorites/:bookId

- **Description:** Remove a favorite book.
- **Request Body:** None
- **Response:**

```json
{ "message": "Favorite removed" }
```

- **Errors:** 401 Unauthorized, 404 Not Found

---

## 🔗 Webhooks

### POST /api/webhook/square

- **Description:** Handle Square webhook events.
- **Request Body:**

```json
{ "type": "payment.updated" }
```

- **Response:**

```json
{ "message": "Event received" }
```

- **Errors:** 400 Bad Request

---

## 💳 Square

### POST /api/square/create-payment

- **Description:** Create payment link.
- **Request Body:**

```json
{ "amount": 1000 }
```

- **Response:**

```json
{ "url": "https://square.link/pay" }
```

- **Errors:** 400 Bad Request

---

## 🖼️ Images

### POST /images/upload

- **Description:** Upload an image.
- **Request Body:**

Binary file upload

- **Response:**

```json
{ "url": "https://example.com/image.png" }
```

- **Errors:** 400 Bad Request

---

## 🔎 Search

### GET /api/search/search

- **Description:** Search books.
- **Request Body:** None
- **Response:**

```json
[
  { "id": "b1", "title": "Matched Book" }
]
```

- **Errors:** 400 Bad Request
