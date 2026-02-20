# 01) System Map

This page explains what parts CowboyLogic has, how they talk to each other, and what usually breaks.

---

## What Runs Where (Plain Language)

- **Website (Frontend)**: `client/` (Vite + React)  
  Hosted on **Vercel**. This is what users see in the browser.

- **API Server (Backend)**: `server/` (Node.js + Express + Sequelize)  
  Hosted on **Render**. This is the “brain” that logs users in, talks to the database, creates checkouts, and receives webhooks.

- **Database (MySQL)**  
  Stores users, books, carts, orders, pages, and other data.

- **Payments (Square)**
  - Customer pays on Square’s checkout page.
  - Square sends a **webhook** (an automated HTTP message) back to our backend to confirm payment:
    - `POST /api/square/webhook`

- **Login Provider (Google)**  
  Google login uses an **ID token**:
  - The browser gets a token from Google
  - The browser sends `id_token` to the backend
  - Backend verifies it using `GOOGLE_CLIENT_ID`

- **Email (Mailgun SMTP)**  
  Email is sent using Mailgun:
  - Backend sends SMTP via `smtp.mailgun.org`
  - Admin/contact emails go to the configured admin inbox

- **Uploads (Cloudinary)**  
  Uploaded images are stored in **Cloudinary**.
  The backend uploads the file to Cloudinary and saves the returned image URL in the database.

---

## Main URLs (Production)

- **Frontend (Website):**
  - `https://www.cowboylogic.net`
  - `https://cowboylogic.net`

- **Backend (API):**
  - `https://api.cowboylogic.net`

- **Square webhook destination:**
  - `https://api.cowboylogic.net/api/square/webhook`

---

## The Main Data Flow (Step by Step)

1. User opens the website in a browser (frontend loads from Vercel).
2. Frontend calls the backend at `https://api.cowboylogic.net/api/*` for login, books, cart, etc.
3. Backend reads/writes MySQL (stores and retrieves data).
4. When a user pays, backend creates a Square checkout link.
5. User completes payment on Square.
6. Square calls our webhook:
   - `POST https://api.cowboylogic.net/api/square/webhook`
7. Backend verifies the webhook signature, confirms the order, and may send emails.

---

## The 3 Things That Break Most Often

### 1) Square webhook signature mismatch

Square signature verification requires the exact webhook URL string.

- Symptom:
  - Square deliveries fail (non-2xx), or backend logs show invalid signature.
- Common cause:
  - mismatch between:
    - Square Dashboard destination URL, and
    - `SQUARE_WEBHOOK_NOTIFICATION_URL`
  - including scheme/host/path/trailing slash differences.

### 2) Frontend cannot reach backend (CORS / wrong API base)

- Symptom:
  - site loads but actions fail (login/cart/checkout) due to network/CORS errors.
- Common causes:
  - backend CORS allowlist does not include the exact frontend origin
  - wrong API base URL configured in the frontend build

### 3) Email sending fails (SMTP credentials / connectivity)

- Symptom:
  - contact form fails or emails never arrive.
- Common causes:
  - wrong `MAIL_USER` / `MAIL_PASS`
  - SMTP connectivity issues (timeouts)
  - missing Mailgun DNS records (SPF/DKIM), causing spam/reject

---

## Quick “Where Do I Check?” Map

- **Is backend running and reachable?**
  - Check Render service status and logs.
  - Test API reachability (see `04-run-and-health-check.md`).

- **Are Square webhooks reaching backend?**
  - Check Square delivery logs and backend logs.
  - See: `micro-services/08-square-operations.md`.

- **Is Google login working?**
  - Confirm Google Cloud OAuth settings + env vars.
  - See: `micro-services/09-google-login-operations.md` (or the updated Google login doc in `micro-services/`).

- **Is email sending working?**
  - Run the contact send test.
  - See: `11-mail-operations.md` and `micro-services/02-mailgun-setup.md`.

- **Are image uploads working?**
  - Confirm Cloudinary env vars and a successful upload test.
  - See: `micro-services/01-cloudinary-setup.md`.

---

## Verified Code Anchors (Source-of-Truth)

These statements are confirmed by runtime code (paths may change over time):

- Backend route wiring: `server/app.js` (Express app + route mounting)
- Square routes: `server/routes/squareRoutes.js` (mounted under `/api/square`)
- Square webhook endpoint: `server/app.js` (mounted under `/api/square/webhook`)
- Google auth endpoint: `server/routes/authRoutes.js` (mounted under `/api/auth`)
- Email sending: `server/services/emailService.js` (SMTP transport)
- Media uploads: Cloudinary integration (search for Cloudinary config/service in `server/`)
