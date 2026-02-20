# 11) Mail Operations

This runbook helps an operator verify that email sending works for:

- Contact form (`POST /api/contact`)
- Optional newsletter/admin mail flows (only if approved)

---

## Required configuration (what must be set)

All email sending runs on the **backend**. These variables must be set in the backend environment (Render in production).

### SMTP (Mailgun) — required for sending

- `MAIL_PROVIDER=mailgun`
- `MAIL_HOST=smtp.mailgun.org`
- `MAIL_PORT=587`
- `MAIL_USER=postmaster@mg.cowboylogic.net`
- `MAIL_PASS=<SMTP_PASSWORD>`

### Message defaults (recommended)

- `MAIL_FROM_NAME=CLP Bookstore`
- `MAIL_FROM_EMAIL=postmaster@mg.cowboylogic.net`
- `MAIL_REPLY_TO=info@cowboylogic.net`

### Recipient for contact form (required)

- `MAIL_ADMIN=info@cowboylogic.net`

### Debug (recommended)

- `MAIL_DEBUG=0`

Notes:

- `MAIL_PASS` is created/reset in Mailgun under **Domain settings → SMTP credentials**.
- `MAIL_FROM_EMAIL` should be an address allowed by the Mailgun domain (normally `postmaster@mg.cowboylogic.net`).

---

## Optional configuration (Mailgun API)

Some features may use Mailgun API now or later.

- `MAILGUN_API_KEY=<MAILGUN_API_KEY>`
- `MAILGUN_DOMAIN=mg.cowboylogic.net`
- `MAILGUN_API_BASE=https://api.mailgun.net/v3`

Important:

- If the Mailgun account/domain is EU, API base may be `https://api.eu.mailgun.net/v3`.
- Do not change the API base unless you know the domain region is EU.

---

## Before you test (fail fast)

1. Confirm the backend is running.
2. Confirm you know the correct backend base URL.

Examples:

- Local dev: `http://localhost:<PORT>`
- Production API: `https://api.cowboylogic.net`

3. Confirm the contact endpoint exists:

- `POST /api/contact`

---

## Test 1 (recommended): deterministic SMTP test via Contact API

This test verifies the full path:
UI/API request → backend → SMTP send → delivery to `MAIL_ADMIN`.

### Step 1 — Restart backend after env changes

If you changed any mail variables, restart the backend (Render redeploy in production).

### Step 2 — Send one test request (PowerShell)

Local example (replace `<PORT>` and `<USER_EMAIL>`):

`Invoke-RestMethod -Method Post -Uri "http://localhost:<PORT>/api/contact" -ContentType "application/json" -Body '{"firstName":"Test","lastName":"Operator","email":"<USER_EMAIL>","message":"SMTP test via /api/contact"}'`

Production example (replace `<USER_EMAIL>`):

`Invoke-RestMethod -Method Post -Uri "https://api.cowboylogic.net/api/contact" -ContentType "application/json" -Body '{"firstName":"Test","lastName":"Operator","email":"<USER_EMAIL>","message":"SMTP test via /api/contact (prod)"}'`

Expected:

1. API response indicates success (example: `Message sent successfully`)
2. Backend logs show a successful send (no timeout/auth/TLS error)
3. `MAIL_ADMIN` inbox receives the email (check Inbox and Spam/Junk)

---

## Test 2 (optional): verify Mailgun SMTP credentials directly

Use this only if Test 1 fails and you need to isolate SMTP issues.

Checklist:

- `MAIL_HOST` is exactly `smtp.mailgun.org`
- `MAIL_PORT` is `587`
- `MAIL_USER` is a full email address (example: `postmaster@mg.cowboylogic.net`)
- `MAIL_PASS` is the latest password after **Reset Password** in Mailgun

If you reset the SMTP password, you must update `MAIL_PASS` in Render and redeploy.

---

## Optional: Newsletter / admin send paths

Run newsletter tests only if you have explicit approval:

- A “test” newsletter can reach real users if lists are misconfigured.

Recommendations:

- Use a dedicated test recipient list if the system supports it.
- If not supported, do not test newsletters on production.

---

## If it fails (common cases)

### A) API request fails (cannot reach backend)

Cause:

- Backend is not running, wrong URL, wrong port.

Fix:

- Open backend logs and confirm the running port and base URL.

### B) Backend returns an error but is reachable

Cause:

- Missing or wrong env vars.

Fix:

- Re-check SMTP vars:
  - `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`
- Restart/redeploy backend after changes.

### C) Connection timeout

Cause (most likely):

- Network path blocked, wrong SMTP host/port, or provider-side connectivity.

Fix:

1. Confirm:
   - `MAIL_HOST=smtp.mailgun.org`
   - `MAIL_PORT=587`
2. If still failing, try TLS port 465:
   - set `MAIL_PORT=465`
3. If your Mailgun account is EU, try EU SMTP host:
   - `MAIL_HOST=smtp.eu.mailgun.org`

After any change: redeploy backend.

### D) SMTP authentication failed

Cause:

- Wrong `MAIL_PASS` (most common) or wrong username.

Fix:

- Mailgun → Domain settings → SMTP credentials → **Reset Password**
- Update `MAIL_PASS` in Render
- Redeploy backend

### E) Email sent but not received

Cause:

- Spam/Junk filtering or DNS auth records missing.

Fix:

- Check Spam/Junk.
- In Mailgun domain settings → DNS records:
  - Ensure SPF/DKIM are verified.
  - DMARC recommended.
- Re-check `MAIL_ADMIN` points to the correct inbox.

---

## Verified code anchors (source of truth)

- `server/services/emailService.js` — transporter config and send logic (`sendEmail`)
- `server/controllers/contactController.js` — contact endpoint handler
- `server/controllers/newsletterController.js` — newsletter send path (if enabled)
