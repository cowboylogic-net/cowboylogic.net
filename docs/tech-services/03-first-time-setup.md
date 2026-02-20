# 03) First-Time Setup (Production: Vercel + Render)

## Goal

Bring the CowboyLogic system to a working state in production:
- Frontend on Vercel
- Backend on Render
- MySQL database (hosting provider)
- Cloudinary for images
- Mailgun for email
- Google Sign-In
- Square payments + webhook

This runbook avoids local setup by default.

---

## Safety rules (P0)

- Never paste real secrets into docs, tickets, chat, screenshots, or commits.
- Do not copy any non-empty values from `.env.example` into production.
- Secrets belong only in approved secret storage and hosting environment-variable dashboards.
- After changing environment variables:
  - redeploy the backend on Render, and/or
  - redeploy the frontend on Vercel.

---

## What you need before starting

You must have access (see `02-access-prerequisites.md`):
- Render (backend service)
- Vercel (frontend project)
- HostGator/cPanel/phpMyAdmin (MySQL)
- Cloudinary dashboard
- Mailgun dashboard
- Google Cloud Console
- Square Developer/Dashboard
- GitHub repo (docs write access)

---

## Step 1 — Confirm the live URLs you are configuring

Production URLs (expected):
- Frontend: `https://www.cowboylogic.net` (also `https://cowboylogic.net`)
- Backend: `https://api.cowboylogic.net`

Rule:
- Do not guess. If these URLs change, update:
  - `VITE_API_URL` (Vercel)
  - `CORS_ORIGINS` (Render)
  - Square webhook destination + `SQUARE_WEBHOOK_NOTIFICATION_URL` (Render)

---

## Step 2 — Configure backend environment variables (Render)

1. Open Render Dashboard.
2. Open the CowboyLogic backend service.
3. Go to the Environment / Environment Variables section.
4. Add/update variables using placeholders (values from secret storage only).

### Backend minimum set (production)

Database:
- `DATABASE_HOST=<DB_HOST>`
- `DATABASE_PORT=<DB_PORT>`
- `DATABASE_NAME=<DB_NAME>`
- `DATABASE_USERNAME=<DB_USER>`
- `DATABASE_PASSWORD=<DB_PASSWORD>`

Auth:
- `NODE_ENV=production`
- `JWT_SECRET=<JWT_SECRET>`
- (optional) `JWT_EXPIRES_IN=<TTL>`
- (optional) `REFRESH_TOKEN_TTL_DAYS=<DAYS>`
- (optional) `ACCESS_TOKEN_TTL_MIN=<MIN>`

CORS:
- `CORS_ORIGINS=https://cowboylogic.net,https://www.cowboylogic.net`

Google:
- `GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`
- `GOOGLE_CLIENT_SECRET=<GOOGLE_CLIENT_SECRET>` (store securely; may be unused by ID-token flow)

Square:
- `SQUARE_ENV=production`
- `SQUARE_ACCESS_TOKEN=<SQUARE_ACCESS_TOKEN>`
- `SQUARE_LOCATION_ID=LB1STCJM1BR20`
- `SQUARE_SUCCESS_URL=https://cowboylogic.net/success`
- `SQUARE_WEBHOOK_SIGNATURE_KEY=<SQUARE_WEBHOOK_SIGNATURE_KEY>`
- `SQUARE_WEBHOOK_NOTIFICATION_URL=https://api.cowboylogic.net/api/square/webhook`
- (optional) `ENABLE_SQUARE_DIAG=1`
- (optional) `ADMIN_ORDERS_EMAIL=info@cowboylogic.net`

Mailgun (SMTP):
- `MAIL_PROVIDER=mailgun`
- `MAIL_HOST=smtp.mailgun.org`
- `MAIL_PORT=587`
- `MAIL_USER=postmaster@mg.cowboylogic.net`
- `MAIL_PASS=<MAIL_PASS>`
- `MAIL_FROM_NAME=CLP Bookstore`
- `MAIL_FROM_EMAIL=postmaster@mg.cowboylogic.net`
- `MAIL_ADMIN=info@cowboylogic.net`
- `MAIL_REPLY_TO=info@cowboylogic.net`
- `MAIL_DEBUG=0`
- (optional) `MAILGUN_API_KEY=<MAILGUN_API_KEY>`
- (optional) `MAILGUN_DOMAIN=mg.cowboylogic.net`
- (optional) `MAILGUN_API_BASE=https://api.mailgun.net/v3`

Cloudinary:
- `MEDIA_PROVIDER=cloudinary`
- `CLOUDINARY_CLOUD_NAME=<CLOUDINARY_CLOUD_NAME>`
- `CLOUDINARY_API_KEY=<CLOUDINARY_API_KEY>`
- `CLOUDINARY_API_SECRET=<CLOUDINARY_API_SECRET>`

Admin bootstrap (only if your environment uses it):
- `ADMIN_EMAIL=<ADMIN_EMAIL>`
- `ADMIN_PASSWORD=<ADMIN_PASSWORD>`

Reason:
- Render terminates HTTPS; backend does not need local PEM paths.

### About `UPLOADS_DIR` (important with Cloudinary)

With Cloudinary enabled:
- uploaded images must not depend on permanent backend disk storage
- the backend may still use temporary files during upload processing

If the code requires `UPLOADS_DIR`, set it to a safe temporary path supported by the host (example placeholder):
- `UPLOADS_DIR=<TEMP_UPLOAD_PATH>`

Do not use Windows-style paths on Render.

---

## Step 3 — Redeploy backend (Render)

After setting/updating env vars:
1. Trigger a redeploy/restart of the backend service.
2. Open Render logs and confirm:
   - the service starts cleanly
   - the database connection succeeds
   - there are no “missing env var” errors

---

## Step 4 — Configure frontend environment variables (Vercel)

1. Open Vercel Dashboard.
2. Open the CowboyLogic frontend project.
3. Go to Settings → Environment Variables.
4. Set:

Required:
- `VITE_API_URL=https://api.cowboylogic.net`

Google login (only if enabled):
- `VITE_GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`

Rules:
- Do not place secrets in Vercel frontend env vars.
- After changes, redeploy the frontend.

---

## Step 5 — Verify the system (operator checks)

### A) Website loads
- Open `https://www.cowboylogic.net`
- Confirm pages load without errors.

### B) Backend is reachable
Use any existing backend “ping” endpoint your system exposes.

Common one in this project:
- `https://api.cowboylogic.net/api/square/_ping`

Expected:
- HTTP status `204`

If it fails, check Render logs and CORS settings.

### C) Google login works
- Open the website → Login
- Click “Login with Google”
Expected:
- login completes successfully

If it fails with “origin mismatch”:
- update Google Cloud “Authorized JavaScript origins”
- confirm `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` match the same client

### D) Email sending works (Mailgun SMTP)
- Submit the Contact form on the website
Expected:
- an email arrives to `MAIL_ADMIN` (example: `info@cowboylogic.net`)
- Render logs show no SMTP auth/timeout error

### E) Cloudinary uploads work
- Use the admin UI upload flow (book cover or image upload)
Expected:
- the saved image URL is a Cloudinary URL
- the image displays after refresh

### F) Square checkout + webhook works
- Trigger a checkout from the website
- In Square Dashboard:
  - confirm webhook deliveries are successful (2xx)
- In Render logs:
  - confirm webhook is received and no signature errors are logged

Webhook URL must be exactly:
- `https://api.cowboylogic.net/api/square/webhook`

---

## If something fails

Do not “try random values”.
Use the relevant service runbook:
- Google login: `micro-services/google-login.md`
- Mailgun: `micro-services/mailgun.md`
- Cloudinary: `micro-services/cloudinary.md`
- Square: `micro-services/square-webhooks.md`

---

# Optional: Local development setup (not required for production)

Use this only if you need to run the app locally for development.

Rules:
- never use production secrets locally unless explicitly approved
- use separate dev credentials where possible
- never commit `.env` files

Client local env:
- `VITE_API_URL=http://localhost:<PORT>`

Server local env:
- use values from dev/stage secret storage only
- run DB ping locally only against a dev database
