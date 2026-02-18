# 15) Troubleshooting (Operator Playbook)

Use these quick actions in **strict order**.
This page is written for operators (non-developers). It aims to avoid unsafe actions.

## Operator safety rules (read first)

- Do **not** disable webhook signature verification in production.
- Do **not** “try random secrets” or ask others to send secrets via chat/email.
- Do **not** edit the database unless a runbook explicitly says so **and you have a backup**.
- If payments or logins are broken for real users: record an incident using `checklists/incident-template.md`.

---

## A) Backend not starting (P0)

### What you’ll see

- `npm start` exits, or server never prints “listening” logs.

### Do this (in order)

1. Confirm required env exists

- Verify `server/.env` exists (or your deployment uses another env source).
- If you changed env values, plan to restart only after completing the checks below.

2. Check database connectivity (fast signal)

- From `server/` run:
  - `npm run db:ping`
- Expected:
  - output includes `Connected OK via`
- If it fails:
  - it is usually DB credentials/host/port/network allowlist.

3. Start backend

- From `server/` run:
  - `npm start`
- Expected:
  - logs show either HTTPS mode or HTTP fallback mode.

4. Identify listener mode from logs

- If logs include `HTTPS backend running on port` → HTTPS mode is active.
- If logs include `HTTP backend running on port` → HTTP fallback mode is active.

### If still failing

- Port conflict:
  - check whether another process is already listening on the port.
  - PowerShell example:
    - `Get-NetTCPConnection -LocalPort <PORT> -State Listen`
- HTTPS expected but missing:
  - verify `SSL_KEY_PATH` and `SSL_CERT_PATH` point to readable files.
  - if unreadable, backend will fall back to HTTP.

**Related runbooks**

- `04-run-and-health-check.md`
- `06-database-operations.md`
- `12-network-cors-https-uploads.md`

---

## B) Frontend cannot call API (P1)

### What you’ll see

- Site loads, but actions fail (login, books, cart) with network/CORS errors.

### Do this (in order)

1. Verify frontend API base URL

- Ensure `VITE_API_URL` is defined **once** in `client/.env`.
- Confirm it points to the correct backend base URL.

2. Verify backend is reachable from the operator machine

- If backend is HTTP:
  - `(Invoke-WebRequest -Method Get -Uri "http://localhost:<PORT>/api/square/_ping").StatusCode`
- If backend is HTTPS:
  - `(Invoke-WebRequest -Method Get -Uri "https://localhost:<PORT_HTTPS>/api/square/_ping").StatusCode`
- Expected:
  - `204`

3. Verify CORS allowlist

- Ensure `CORS_ORIGINS` includes the exact frontend origin (scheme + host + port).
- Restart backend after CORS changes.

**Related runbooks**

- `03-first-time-setup.md`
- `04-run-and-health-check.md`
- `12-network-cors-https-uploads.md`

---

## C) Square webhook delivery fails (P0)

This is payment-critical. Follow the exact order.

### What you’ll see

- Square Dashboard shows delivery failures, or orders don’t finalize after payment.

### Do this (in order)

1. Confirm the webhook destination URL in Square Dashboard

- It must be:
  - `<PUBLIC_URL>/api/square/webhook`
- Common mistake:
  - wrong path like `/api/webhook/square` (legacy).

2. Confirm `SQUARE_WEBHOOK_NOTIFICATION_URL` matches exactly

- It must match the destination URL **exactly**:
  - same `https://`
  - same host
  - same path `/api/square/webhook`
  - same trailing slash behavior (prefer no trailing slash)

3. Confirm `SQUARE_WEBHOOK_SIGNATURE_KEY` is set (fail-closed)

- If backend logs show `No SQUARE_WEBHOOK_SIGNATURE_KEY set`:
  - this is a misconfiguration.
  - set the key in runtime env and restart backend **before** accepting production traffic.

4. Send a Square test webhook

- Use Square Dashboard test delivery tool for the current subscription.
- Expected:
  - Square reports success (2xx)
  - backend logs show inbound webhook marker
  - no signature error is logged

**Related runbooks**

- `07-ngrok-operations.md` (if using ngrok; URL changes are common)
- `08-square-operations.md`
- `13-env-reference.md`

---

## D) Signature mismatch / “Invalid Square signature” (P0)

### Most common cause

- URL mismatch between:
  - Square Dashboard webhook URL
  - `SQUARE_WEBHOOK_NOTIFICATION_URL`
  - actual public URL (especially when ngrok restarted)

### Do this (in order)

1. Re-check exact match (scheme/host/path/trailing slash)

- Align Square Dashboard webhook destination and `SQUARE_WEBHOOK_NOTIFICATION_URL`.

2. Restart backend after env update

- Do not assume env changes apply without restart.

3. Confirm signature key is present (fail-closed)

- If log shows `No SQUARE_WEBHOOK_SIGNATURE_KEY set`:
  - set it and restart.
  - do not proceed with production traffic until fixed.

**Related runbooks**

- `07-ngrok-operations.md`
- `08-square-operations.md`

---

## E) Google login fails (P1)

### What you’ll see

- Google button missing, or login fails after clicking Google.

### Do this (in order)

1. Confirm client/server IDs match the same Google OAuth client

- Client:
  - `VITE_GOOGLE_CLIENT_ID`
- Server:
  - `GOOGLE_CLIENT_ID`
- These must refer to the same OAuth client.

2. Confirm the backend route responds

- Verify backend is up using ping:
  - `(Invoke-WebRequest -Method Get -Uri "http://localhost:<PORT>/api/square/_ping").StatusCode`
- Expected:
  - `204`

3. If still failing

- Treat as configuration mismatch (wrong client ID, wrong origin, or wrong environment values).
- Escalate to whoever owns Google Cloud Console access.

**Related runbook**

- `09-google-login-operations.md`
- `13-env-reference.md`

---

## F) Admin cannot log in (P0/P1 depending on impact)

### What you’ll see

- Admin user cannot access admin pages or cannot log in at all.

### Do this (in order)

1. Confirm you are using the correct admin email

- Use the known admin identity from secret storage:
  - `<ADMIN_EMAIL>`
- Do not guess.

2. If you can still access an admin session elsewhere

- Use authenticated password reset (preferred).
- Avoid DB changes.

3. If fully locked out

- Follow controlled DB recovery **only** with backup first.

**Related runbook**

- `10-super-admin-access-recovery.md`

---

## G) Mail not sending (P1)

### What you’ll see

- Contact form says failed, or no emails arrive.

### Do this (in order)

1. Validate mail env variables exist

- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`
- recipient:
  - `MAIL_ADMIN` (or `EMAIL_ADMIN` fallback)

2. Re-test with contact endpoint (deterministic)

- See `11-mail-operations.md` for the exact test steps.

3. If still failing

- Check SMTP provider limits/policy (rate limits, “less secure apps”, TLS requirements).
- Escalate to mail provider admin if needed.

**Related runbook**

- `11-mail-operations.md`
- `13-env-reference.md`

---

## References (code anchors)

- `server/app.js` (routes and middleware wiring)
- `server/middleware/verifySquareSignature.js` (signature checks)
- `server/controllers/googleAuthController.js` (Google verification)
- `server/services/emailService.js` (SMTP transport)
