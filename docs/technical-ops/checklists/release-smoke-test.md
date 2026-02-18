# Release Smoke Test Checklist

Use this after any environment/config/integration change.

Rule: run in order. **Stop at the first failure** and use `../15-troubleshooting.md`.

---

## Quick links (official)

- Square Dashboard: https://squareup.com/dashboard
- Square Developer Dashboard: https://developer.squareup.com/
- Google Cloud Console: https://console.cloud.google.com/
- ngrok Dashboard: https://dashboard.ngrok.com/
- ngrok Official Website: https://ngrok.com/

---

## Preparation (2 minutes)

1. Confirm environment (DEV/UAT/PROD).
2. Confirm backend mode and ports from `server/.env`:

- `PORT` (HTTP)
- `PORT_HTTPS` (HTTPS, if used)

3. Confirm how backend is run:

- PM2 or non-PM2 (do not mix).

---

## Core checks

### 1) Backend process is running once (P0)

- If using PM2:
  - `pm2 status`
  - Expected: exactly one process named `cowboylogic-api` and status `online`
- If not using PM2:
  - Start backend from `server/` using `npm start`
  - Expected: backend stays running and prints listener logs

### 2) Frontend loads without runtime errors (P1)

- Open the site in a browser.
- Expected: page loads, no crash/blank screen.
- If there is a visible error banner or blank page: stop and troubleshoot.

### 3) Ping endpoint returns 204 (P0)

- HTTP mode:
  - `(Invoke-WebRequest -Method Get -Uri "http://localhost:<PORT>/api/square/_ping").StatusCode`
- HTTPS mode:
  - `(Invoke-WebRequest -Method Get -Uri "https://localhost:<PORT_HTTPS>/api/square/_ping").StatusCode`
- Expected: `204`

### 4) Static check returns JSON (P1)

- HTTP mode:
  - `$r = Invoke-RestMethod -Method Get -Uri "http://localhost:<PORT>/__static_check"; $r.ok; $r.uploadsDir`
- HTTPS mode:
  - `$r = Invoke-RestMethod -Method Get -Uri "https://localhost:<PORT_HTTPS>/__static_check"; $r.ok; $r.uploadsDir`
- Expected:
  - `$r.ok` is `True`
  - `$r.uploadsDir` is a valid path

### 5) User login works (email/password) (P0)

- In browser:
  - log in using a known test user account
- Expected:
  - login succeeds and user can browse protected actions (if any)

### 6) Google login works (P1)

- In browser:
  - click Google login
- Expected:
  - login succeeds and you return to the app
- If it fails: stop and use `../15-troubleshooting.md` section E.

### 7) Cart checkout creates Square link (P0)

- In browser:
  - add an item to cart
  - click checkout/pay
- Expected:
  - backend returns/produces a Square checkout URL and browser redirects to Square checkout

### 8) Square webhook test delivery succeeds (P0)

Prerequisite:

- You must have a public webhook URL configured (production domain or ngrok tunnel).

- In Square Dashboard:
  - open Webhooks
  - use “test” delivery to the current subscription
- Expected:
  - Square shows delivery success (2xx)
  - backend logs show inbound webhook marker
  - no signature error is logged

### 9) Orders show expected result (P1)

Use the safest available method for your environment:

- Preferred (UI):
  - open the app’s Orders view (user orders or admin orders, if available)
  - confirm the test order appears (or order state updated after webhook)

If your environment uses an API route for orders and your team documented it, verify it via that route.
If you do not know the route: do not guess—use UI or escalate.

### 10) Contact or newsletter mail send works (P1)

- Preferred deterministic check:
  - run the contact test in `../11-mail-operations.md`
- Expected:
  - API response indicates success
  - email arrives in the target mailbox (check Spam/Junk too)

---

## Security checks

- No secret values exposed in logs/screenshots/docs.
- Latest rotated secrets are active in runtime env.
- Webhook signature verification is active (no bypass warning in backend logs).

---

## If any check fails

1. Stop release promotion.
2. Record:

- failing check number
- timestamp
- environment
- what changed last

3. Follow `../15-troubleshooting.md` and, if needed, record an incident using `incident-template.md`.
