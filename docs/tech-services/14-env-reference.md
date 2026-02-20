# 13) Environment Variables Reference

This page is a reference for environment variables used by CowboyLogic.

It tells you:

- which variables you must set,
- where each variable must be set (Render backend vs Vercel frontend),
- what each variable does,
- what to do after changes.

---

## Safety rules (P0)

- Never put real secret values into docs, tickets, chat, screenshots, or commits.
- Use placeholders only (example: `<JWT_SECRET>`, `<SQUARE_ACCESS_TOKEN>`).
- After changing env values:
  - redeploy the backend on Render (for backend env changes),
  - redeploy the frontend on Vercel (for frontend env changes),
  - then verify the affected flow (login, checkout, email, uploads).

---

## Production deployment model (current)

- Frontend runs on **Vercel**.
- Backend runs on **Render**.
- Database is **MySQL**.
- Payments use **Square** with a fixed production webhook URL:
  - `https://api.cowboylogic.net/api/square/webhook`
- Images are stored on **Cloudinary** (not on backend disk).
- Email is sent via **Mailgun** (SMTP).

---

## Quick start (minimal production sets)

### A) Frontend (Vercel)

Required:

- `VITE_API_URL=<BACKEND_BASE_URL>`  
  Example: `https://api.cowboylogic.net`
- `VITE_GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>` (only if Google login is enabled)

Important:

- Frontend must not contain secrets.

### B) Backend (Render)

Required (baseline operation):

- Database: `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_PORT`
- Auth: `JWT_SECRET`, plus token TTL settings if used
- CORS: `CORS_ORIGINS`
- Google login: `GOOGLE_CLIENT_ID` (if enabled)
- Square: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_SUCCESS_URL`, `SQUARE_WEBHOOK_SIGNATURE_KEY`, `SQUARE_WEBHOOK_NOTIFICATION_URL`, `SQUARE_ENV`
- Mailgun: `MAIL_PROVIDER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_ADMIN` (+ recommended sender fields)
- Cloudinary: `MEDIA_PROVIDER`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## Client (Vercel / `client/.env`)

| Variable                    | Required    | Purpose                     | Where to set    | Notes                                              |
| --------------------------- | ----------- | --------------------------- | --------------- | -------------------------------------------------- |
| `VITE_API_URL`              | Yes         | Backend API base URL        | Vercel env vars | Use the public backend base URL (no trailing `/`). |
| `VITE_GOOGLE_CLIENT_ID`     | Conditional | Enables Google login button | Vercel env vars | Must match backend `GOOGLE_CLIENT_ID`.             |
| `VITE_COMPANY_NAME`         | No          | Terms/Privacy text          | Vercel env vars | Content-only.                                      |
| `VITE_CONTACT_EMAIL`        | No          | Terms/Privacy text          | Vercel env vars | Content-only.                                      |
| `VITE_COMPANY_ADDRESS`      | No          | Privacy text                | Vercel env vars | Content-only.                                      |
| `VITE_JURISDICTION`         | No          | Terms/Privacy legal text    | Vercel env vars | Content-only.                                      |
| `VITE_PRIVACY_LAST_UPDATED` | No          | Privacy date text           | Vercel env vars | Content-only.                                      |
| `VITE_TERMS_LAST_UPDATED`   | No          | Terms date text             | Vercel env vars | Content-only.                                      |

---

## Server (Render / `server/.env`)

### Database

| Variable            | Required | Purpose     | Where to set    | Notes           |
| ------------------- | -------- | ----------- | --------------- | --------------- |
| `DATABASE_HOST`     | Yes      | DB host     | Render env vars | MySQL host.     |
| `DATABASE_PORT`     | Yes      | DB port     | Render env vars | Usually `3306`. |
| `DATABASE_NAME`     | Yes      | DB name     | Render env vars |                 |
| `DATABASE_USERNAME` | Yes      | DB username | Render env vars |                 |
| `DATABASE_PASSWORD` | Yes      | DB password | Render env vars | Secret.         |

### Auth / cookies

| Variable                 | Required    | Purpose                  | Where to set    | Notes                                                      |
| ------------------------ | ----------- | ------------------------ | --------------- | ---------------------------------------------------------- |
| `NODE_ENV`               | Yes (prod)  | Runtime mode             | Render env vars | Set to `production` in prod.                               |
| `JWT_SECRET`             | Yes         | JWT signing key          | Render env vars | Secret. Rotation invalidates sessions.                     |
| `JWT_EXPIRES_IN`         | No          | Access token TTL         | Render env vars | Default exists in code if unset.                           |
| `REFRESH_TOKEN_TTL_DAYS` | No          | Refresh token TTL        | Render env vars | Default exists in code if unset.                           |
| `ACCESS_TOKEN_TTL_MIN`   | No          | Access token TTL minutes | Render env vars | Default exists in code if unset.                           |
| `COOKIE_DOMAIN`          | Recommended | Cookie scope             | Render env vars | Example: `.cowboylogic.net`                                |
| `COOKIE_SAMESITE`        | Recommended | Cookie policy            | Render env vars | Example: `None` (case-sensitive behavior depends on code). |

### CORS / public base

| Variable       | Required    | Purpose                  | Where to set    | Notes                                                                     |
| -------------- | ----------- | ------------------------ | --------------- | ------------------------------------------------------------------------- |
| `CORS_ORIGINS` | Yes         | Allowed frontend origins | Render env vars | Must include `https://www.cowboylogic.net` and `https://cowboylogic.net`. |
| `BASE_URL`     | Recommended | Public base URL          | Render env vars | Example: `https://api.cowboylogic.net`                                    |

### Google login

| Variable               | Required    | Purpose                 | Where to set    | Notes                                                                         |
| ---------------------- | ----------- | ----------------------- | --------------- | ----------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | Conditional | ID token audience check | Render env vars | Must match `VITE_GOOGLE_CLIENT_ID`.                                           |
| `GOOGLE_CLIENT_SECRET` | Conditional | OAuth client secret     | Render env vars | Store securely. May be unused for ID-token-only flow. Do not put on frontend. |

### Square payments + webhook

| Variable                          | Required   | Purpose                                     | Where to set    | Notes                                                             |
| --------------------------------- | ---------- | ------------------------------------------- | --------------- | ----------------------------------------------------------------- |
| `SQUARE_ENV`                      | Yes        | Square environment                          | Render env vars | `production` in prod.                                             |
| `SQUARE_ACCESS_TOKEN`             | Yes        | Square API auth                             | Render env vars | Secret.                                                           |
| `SQUARE_LOCATION_ID`              | Yes        | Location for checkout                       | Render env vars | Example: `LB1STCJM1BR20`                                          |
| `SQUARE_APPLICATION_ID`           | Optional   | Square app id                               | Render env vars | Keep if used by client/UI; otherwise optional.                    |
| `SQUARE_SUCCESS_URL`              | Yes        | Redirect after payment                      | Render env vars | Must be a real website URL, not localhost.                        |
| `SQUARE_WEBHOOK_SIGNATURE_KEY`    | Yes (prod) | Webhook signature verification              | Render env vars | Secret. Must be set for prod traffic.                             |
| `SQUARE_WEBHOOK_NOTIFICATION_URL` | Yes (prod) | Canonical webhook URL for signature payload | Render env vars | Must be exactly: `https://api.cowboylogic.net/api/square/webhook` |
| `ENABLE_SQUARE_DIAG`              | No         | Enables diagnostics logs/routes             | Render env vars | Example: `1` enables.                                             |

### Mailgun (SMTP + optional API)

| Variable           | Required    | Purpose                | Where to set    | Notes                                    |
| ------------------ | ----------- | ---------------------- | --------------- | ---------------------------------------- |
| `MAIL_PROVIDER`    | Yes         | Selects mail provider  | Render env vars | `mailgun`                                |
| `MAIL_HOST`        | Yes         | SMTP host              | Render env vars | `smtp.mailgun.org`                       |
| `MAIL_PORT`        | Yes         | SMTP port              | Render env vars | Usually `587`                            |
| `MAIL_USER`        | Yes         | SMTP username          | Render env vars | Example: `postmaster@mg.cowboylogic.net` |
| `MAIL_PASS`        | Yes         | SMTP password          | Render env vars | Secret.                                  |
| `MAIL_ADMIN`       | Yes         | Contact form recipient | Render env vars | Example: `info@cowboylogic.net`          |
| `MAIL_FROM_NAME`   | Recommended | Sender display name    | Render env vars | Example: `CLP Bookstore`                 |
| `MAIL_FROM_EMAIL`  | Recommended | Sender email           | Render env vars | Example: `postmaster@mg.cowboylogic.net` |
| `MAIL_REPLY_TO`    | Recommended | Reply-to email         | Render env vars | Example: `info@cowboylogic.net`          |
| `MAIL_DEBUG`       | No          | Debug logging          | Render env vars | `0` recommended in prod                  |
| `MAILGUN_API_KEY`  | Optional    | Mailgun API key        | Render env vars | Secret.                                  |
| `MAILGUN_DOMAIN`   | Optional    | Mailgun domain         | Render env vars | Example: `mg.cowboylogic.net`            |
| `MAILGUN_API_BASE` | Optional    | Mailgun API base       | Render env vars | Example: `https://api.mailgun.net/v3`    |

### Cloudinary (media uploads)

| Variable                | Required              | Purpose                 | Where to set    | Notes            |
| ----------------------- | --------------------- | ----------------------- | --------------- | ---------------- |
| `MEDIA_PROVIDER`        | Yes (Cloudinary mode) | Selects media provider  | Render env vars | `cloudinary`     |
| `CLOUDINARY_CLOUD_NAME` | Yes                   | Cloudinary account name | Render env vars | Not secret.      |
| `CLOUDINARY_API_KEY`    | Yes                   | Cloudinary API key      | Render env vars | Treat as secret. |
| `CLOUDINARY_API_SECRET` | Yes                   | Cloudinary API secret   | Render env vars | Secret.          |

### Admin / operational mail

| Variable             | Required    | Purpose                   | Where to set    | Notes                               |
| -------------------- | ----------- | ------------------------- | --------------- | ----------------------------------- |
| `ADMIN_EMAIL`        | Conditional | Super admin seed email    | Render env vars | Used only for bootstrap/seed logic. |
| `ADMIN_PASSWORD`     | Conditional | Super admin seed password | Render env vars | Secret. Do not store in docs.       |
| `ADMIN_ORDERS_EMAIL` | Optional    | Copy order notifications  | Render env vars | Example: `info@cowboylogic.net`     |

---

## Operator tip

After any env change:

- if you changed Render env vars → redeploy backend on Render,
- if you changed Vercel env vars → redeploy frontend on Vercel,
- then verify the affected feature (Google login, Square checkout/webhook, Mail sending, Cloudinary upload).
