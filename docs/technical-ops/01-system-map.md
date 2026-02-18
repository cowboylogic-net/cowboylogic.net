# 01) System Map

This page explains **what parts CowboyLogic has**, **how they talk to each other**, and **what usually breaks**.

---

## What Runs Where (Plain Language)

- **Website (Frontend)**: `client/` (Vite + React)  
  This is what users see in the browser.

- **API Server (Backend)**: `server/` (Node.js + Express + Sequelize)  
  This is the “brain” that logs users in, talks to the database, and creates checkouts.

- **Database (MySQL)**  
  Stores users, books, carts, orders, pages, and other data.

- **Payments (Square)**
  - Customer pays on Square’s checkout page.
  - Square sends a **webhook** (an automated HTTP message) back to our backend to confirm payment.

- **Login Provider (Google)**  
  Google login uses an **ID token**: the browser gets a token from Google and sends it to our backend for verification.

- **Email (SMTP)**  
  SMTP is the email server used to send contact/newsletter/order emails.

- **Uploads (Files)**  
  Uploaded files are stored on disk and served from `/uploads`.

---

## The Main Data Flow (Step by Step)

1. **User opens the website** in a browser (frontend loads).
2. **Frontend calls backend** at `/api/*` (for login, books, cart, etc.).
3. **Backend reads/writes MySQL** (stores and retrieves data).
4. **When user pays**, backend creates a Square checkout link.
5. **User completes payment on Square**.
6. **Square calls our webhook**: `POST /api/square/webhook`
7. **Backend verifies the webhook signature**, confirms the order, and sends emails.

---

## The 3 Things That Break Most Often

### 1) ngrok URL changed

If you use ngrok, the public URL can change after restart.

- Result: Square webhooks stop arriving or signature verification fails.
- Fix: follow `07-ngrok-operations.md` (“ngrok URL changed” procedure).

### 2) Webhook signature mismatch

Square signature verification requires the **exact** webhook URL.

- Result: backend logs show signature mismatch / invalid signature.
- Usually caused by: wrong scheme/host/path or trailing slash mismatch between:
  - Square Dashboard webhook URL, and
  - `SQUARE_WEBHOOK_NOTIFICATION_URL`

### 3) Frontend cannot reach backend (CORS / wrong API base)

- Result: site loads but actions fail (login/cart/checkout).
- Fix: check `VITE_API_URL` (frontend) and `CORS_ORIGINS` (backend).

---

## Quick “Where Do I Check?” Map

- **Is backend running?**  
  Use health checks in `04-run-and-health-check.md` (ping endpoint).

- **Are Square webhooks reaching backend?**  
  Check Square delivery logs + backend logs (see `08-square-operations.md`).

- **Is Google login working?**  
  Confirm client/server Google IDs match (see `09-google-login-operations.md`).

- **Is email sending working?**  
  Run the contact test (see `11-mail-operations.md`).

- **Are uploads working?**  
  Check upload directory permissions and `/uploads` serving (see `12-network-cors-https-uploads.md`).

---

## Verified Code Anchors (Source-of-Truth)

These statements are confirmed by runtime code (paths may change over time):

- Backend route wiring: `server/app.js` (Express app + route mounting).
- Square checkout route: `server/routes/squareRoutes.js` (`POST /create-payment` under `/api/square`).
- Square webhook endpoint: `server/app.js` (`POST /api/square/webhook`).
- Google auth endpoint: `server/routes/authRoutes.js` (`POST /google` under `/api/auth`).
- Upload static serving: `server/app.js` (static mount for `/uploads`).
