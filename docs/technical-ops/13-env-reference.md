# 13) Environment Variables Reference

This page is a reference for environment variables used by CowboyLogic.

It is written for operators (including non-developers). It tells you:

- which variables you must set,
- when a variable is only needed in a specific scenario (HTTPS / ngrok / split deploy),
- where each variable is used in code (path + identifier).

## Safety Rules (P0)

- Never put real secret values into docs, tickets, chat, screenshots, or commits.
- In this document, use placeholders only, for example: `<JWT_SECRET>`, `<SQUARE_ACCESS_TOKEN>`.
- After rotating or changing any env values: restart backend and re-run health checks (see `04-run-and-health-check.md`).

## How to Read “Required”

- **Yes**: required for baseline operation in most environments (service won’t start or a core flow won’t work).
- **Conditional**: required only for a specific setup (example: split deploy, ngrok tunnel, direct HTTPS).
- **No**: optional; the app has a default or the feature is optional.

## Quick Start: Minimal Sets (operator-friendly)

### A) Local development (frontend + backend on same machine)

Client:

- `VITE_API_URL` (points to your backend base URL)

Server:

- Database: `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_NAME` (and sometimes `DATABASE_PORT`)
- Auth: `JWT_SECRET`
- Square: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_SUCCESS_URL`
- Google login (if used): `GOOGLE_CLIENT_ID`
- SMTP (if you need contact/newsletter): `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, plus `MAIL_ADMIN` (or `EMAIL_ADMIN` fallback)

### B) Split deploy (frontend and backend on different hosts)

Client:

- `VITE_API_URL` (must be the public backend URL)

Server:

- `CORS_ORIGINS` (must include the frontend origin, e.g. `https://frontend.example.com`)

### C) ngrok used for Square webhooks

Server:

- `SQUARE_WEBHOOK_NOTIFICATION_URL` (must match the _exact_ public URL used by Square, including `/api/square/webhook`)
  Square Dashboard:
- webhook destination URL must match the same URL exactly

(See `07-ngrok-operations.md` and `08-square-operations.md`.)

### D) Direct HTTPS mode (backend serves HTTPS itself)

Server:

- `PORT_HTTPS`, `SSL_KEY_PATH`, `SSL_CERT_PATH`

---

## Client (`client/.env.example`)

Important:

- `VITE_API_URL` appears twice in `client/.env.example`.
- In your real `.env`, keep only **one** `VITE_API_URL`.

| Variable                    | Required                              | Purpose                    | Used in (path + identifier)                                                                                    | Status         |
| --------------------------- | ------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------- |
| `VITE_GOOGLE_CLIENT_ID`     | Yes (for Google login)                | Google provider client ID  | `client/src/main.jsx` (`GoogleOAuthProvider`)                                                                  | Active         |
| `VITE_API_URL`              | Yes for split frontend/backend deploy | Frontend API base URL      | `client/src/utils/apiBase.js` (`getApiBase`), `client/src/components/BookForm/BookForm.jsx` (`baseUrl`)        | Active         |
| `VITE_COMPANY_NAME`         | No                                    | Terms/Privacy text         | `client/src/pages/Terms/Terms.jsx` (`COMPANY_NAME`), `client/src/pages/Privacy/Privacy.jsx` (`COMPANY_NAME`)   | Active content |
| `VITE_CONTACT_EMAIL`        | No                                    | Terms/Privacy contact text | `client/src/pages/Terms/Terms.jsx` (`CONTACT_EMAIL`), `client/src/pages/Privacy/Privacy.jsx` (`CONTACT_EMAIL`) | Active content |
| `VITE_COMPANY_ADDRESS`      | No                                    | Privacy text               | `client/src/pages/Privacy/Privacy.jsx` (`COMPANY_ADDRESS`)                                                     | Active content |
| `VITE_JURISDICTION`         | No                                    | Terms/Privacy legal text   | `client/src/pages/Terms/Terms.jsx` (`JURISDICTION`), `client/src/pages/Privacy/Privacy.jsx` (`JURISDICTION`)   | Active content |
| `VITE_PRIVACY_LAST_UPDATED` | No                                    | Privacy date text          | `client/src/pages/Privacy/Privacy.jsx` (`LAST_UPDATED`)                                                        | Active content |
| `VITE_TERMS_LAST_UPDATED`   | No                                    | Terms date text            | `client/src/pages/Terms/Terms.jsx` (`LAST_UPDATED`)                                                            | Active content |

---

## Server (`server/.env.example`)

| Variable                          | Required                                                       | Purpose                             | Used in (path + identifier)                                                                       | Status                  |
| --------------------------------- | -------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------- |
| `DATABASE_USERNAME`               | Yes                                                            | DB auth user                        | `server/config/db.js` (`Sequelize(...)`)                                                          | Active                  |
| `DATABASE_PASSWORD`               | Yes                                                            | DB auth password                    | `server/config/db.js` (`Sequelize(...)`)                                                          | Active                  |
| `DATABASE_HOST`                   | Yes                                                            | DB host                             | `server/config/db.js` (`Sequelize(...)`)                                                          | Active                  |
| `DATABASE_NAME`                   | Yes                                                            | DB name                             | `server/config/db.js` (`Sequelize(...)`)                                                          | Active                  |
| `DATABASE_PORT`                   | No (default exists)                                            | DB port                             | `server/config/db.js` (`port`)                                                                    | Active                  |
| `PORT`                            | No (default exists)                                            | HTTP port                           | `server/server.js` (`PORT`)                                                                       | Active                  |
| `NODE_ENV`                        | Yes for production correctness                                 | Runtime mode                        | `server/utils/cookies.js` (`computeCookieOpts`), `server/services/squareService.js` (`wantProd`)  | Active                  |
| `JWT_SECRET`                      | Yes                                                            | JWT signing key                     | `server/middleware/authMiddleware.js` (`protect`), `server/config/requireEnv.js` (`requireEnv`)   | Active critical         |
| `JWT_EXPIRES_IN`                  | No (default exists)                                            | Access token TTL                    | `server/controllers/authController.js` (`generateToken`)                                          | Active                  |
| `COOKIE_SAMESITE`                 | No                                                             | Refresh cookie policy               | `server/utils/cookies.js` (`computeCookieOpts`)                                                   | Active                  |
| `COOKIE_DOMAIN`                   | No                                                             | Refresh cookie domain               | `server/utils/cookies.js` (`computeCookieOpts`)                                                   | Active                  |
| `REFRESH_TOKEN_TTL_DAYS`          | No (default exists)                                            | Refresh token TTL                   | `server/controllers/refreshController.js` (`REFRESH_DAYS`)                                        | Active                  |
| `ACCESS_TOKEN_TTL_MIN`            | No (default exists)                                            | Access token TTL minutes            | `server/controllers/refreshController.js` (`ACCESS_MIN`)                                          | Active                  |
| `MAIL_ADMIN`                      | Conditional (required for contact unless `EMAIL_ADMIN` is set) | Contact recipient                   | `server/services/emailService.js` (`sendContactEmail`)                                            | Active                  |
| `MAIL_DEBUG`                      | No                                                             | Mail debug logging                  | `server/services/emailService.js` (`transporter`)                                                 | Active                  |
| `MAIL_HOST`                       | Yes for SMTP                                                   | SMTP host                           | `server/services/emailService.js` (`transporter`)                                                 | Active                  |
| `MAIL_PORT`                       | Yes for SMTP                                                   | SMTP port                           | `server/services/emailService.js` (`PORT`)                                                        | Active                  |
| `MAIL_USER`                       | Yes for SMTP                                                   | SMTP username                       | `server/services/emailService.js` (`transporter`)                                                 | Active                  |
| `MAIL_PASS`                       | Yes for SMTP                                                   | SMTP password                       | `server/services/emailService.js` (`transporter`)                                                 | Active critical         |
| `MAIL_FROM_NAME`                  | No                                                             | Sender display name                 | `server/services/emailService.js` (`sendEmail`)                                                   | Active                  |
| `MAIL_FROM_EMAIL`                 | No                                                             | Sender email                        | `server/services/emailService.js` (`sendEmail`)                                                   | Active                  |
| `GOOGLE_CLIENT_ID`                | Yes for Google login                                           | Google ID token audience            | `server/controllers/googleAuthController.js` (`OAuth2Client`, `verifyIdToken`)                    | Active critical         |
| `GOOGLE_CLIENT_SECRET`            | No                                                             | Not used in current runtime path    | No runtime usage found in repo code                                                               | Not used / verify       |
| `ADMIN_EMAIL`                     | Conditional (seed use)                                         | Super admin seed email              | `server/seeders/20250826090000-seed-super-admin.cjs` (`up`)                                       | Seed-only               |
| `ADMIN_PASSWORD`                  | Conditional (seed use)                                         | Super admin seed password           | `server/seeders/20250826090000-seed-super-admin.cjs` (`up`)                                       | Seed-only sensitive     |
| `ADMIN_ORDERS_EMAIL`              | No                                                             | Optional order copy email           | `server/controllers/webhookController.js` (`squareWebhookHandler`)                                | Active optional         |
| `SQUARE_APPLICATION_ID`           | No                                                             | Declared, no runtime usage found    | No runtime usage found in repo code                                                               | Not used / verify       |
| `SQUARE_ACCESS_TOKEN`             | Yes                                                            | Square API auth                     | `server/services/squareService.js` (`SquareClient`), `server/config/requireEnv.js` (`requireEnv`) | Active critical         |
| `SQUARE_LOCATION_ID`              | Yes                                                            | Square location for checkout        | `server/services/squareService.js` (`locationId`), `server/config/requireEnv.js`                  | Active critical         |
| `SQUARE_SUCCESS_URL`              | Yes                                                            | Post-payment success redirect       | `server/controllers/squareController.js` (`checkoutOptions.redirectUrl`)                          | Active critical         |
| `SQUARE_WEBHOOK_SIGNATURE_KEY`    | Yes for production                                             | Webhook signature verification      | `server/middleware/verifySquareSignature.js` (`secret`)                                           | Active security control |
| `SQUARE_WEBHOOK_NOTIFICATION_URL` | Conditional (required behind proxy/tunnel)                     | Canonical URL for signature payload | `server/middleware/verifySquareSignature.js` (`notifUrl`)                                         | Active security control |
| `ENABLE_SQUARE_DIAG`              | No                                                             | Enables Square diagnostics route    | `server/app.js` (`if ENABLE_SQUARE_DIAG`)                                                         | Active optional         |
| `BASE_URL`                        | No                                                             | Public base URL builder             | `server/config/publicBase.js` (`getPublicBase`)                                                   | Active optional         |
| `CORS_ORIGINS`                    | Conditional (required for cross-origin deploy)                 | Allowed frontend origins            | `server/app.js` (`allowedOrigins`)                                                                | Active                  |
| `PORT_HTTPS`                      | Conditional (direct HTTPS)                                     | HTTPS listener port                 | `server/server.js` (`PORT_HTTPS`)                                                                 | Active optional         |
| `SQUARE_ENV`                      | No                                                             | Square prod/sandbox mode            | `server/services/squareService.js` (`wantProd`)                                                   | Active optional         |
| `SSL_KEY_PATH`                    | Conditional (direct HTTPS)                                     | TLS key path                        | `server/server.js` (`KEY_PATH`)                                                                   | Active optional         |
| `SSL_CERT_PATH`                   | Conditional (direct HTTPS)                                     | TLS cert path                       | `server/server.js` (`CERT_PATH`)                                                                  | Active optional         |
| `UPLOADS_DIR`                     | No (fallback exists)                                           | Upload filesystem root              | `server/app.js` (`UPLOADS_DIR`), `server/config/imageConfig.js` (`uploadBasePath`)                | Active optional         |

---

## Additional Code-Discovered Variables (advanced; verify before use)

These variables were seen in code but may not be required in your deployment.
Do not “guess” values. Only set them if a runbook or your team explicitly instructs you.

- `COOKIE_SECURE` (cookie security posture; depends on HTTPS)
- `MIGRATE_WITH_SYNC` (migration mode switch; do not use in production unless instructed)
- `MAIL_REDIRECT_ALL_TO` (mail safety/testing option)
- `MAIL_FROM` (legacy/alternate sender key)
- `EMAIL_ADMIN` (fallback recipient key when `MAIL_ADMIN` is not set)
- `DOTENV_PATH` (custom env file loader path)
- `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_HOST`, `DB_PORT` (fallback aliases in Sequelize CLI config)

Operator tip:

- After any env change, restart backend and verify with `04-run-and-health-check.md`.
