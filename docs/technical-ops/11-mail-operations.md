# 11) Mail Operations

This runbook helps an operator verify that SMTP email sending works (contact form and, optionally, newsletter).

---

## Baseline Mail Inputs (what you must have)

Get these values from **approved secret storage** or your **SMTP provider settings** (do not copy secrets into docs/chat).

Required to send email:

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USER`
- `MAIL_PASS`

Recommended (makes emails look correct):

- `MAIL_FROM_NAME` (display name)
- `MAIL_FROM_EMAIL` (optional; if missing, the system may fall back to `MAIL_USER`)

Recipient for contact form (set this to always be safe):

- `MAIL_ADMIN` (recommended: always set this)

Notes:

- Some deployments may also support `EMAIL_ADMIN` as a fallback. Do not rely on it unless your team verified it. If unsure, set `MAIL_ADMIN`.

---

## Before You Test (fail fast)

1. Confirm the backend is running.
2. Confirm you know the correct backend URL:

- Local HTTP example: `http://localhost:<PORT>`
- If your backend runs HTTPS locally: `https://localhost:<PORT_HTTPS>` (may require local trust/ignore warnings)

3. Confirm contact endpoint exists:

- The runbook uses: `POST /api/contact`

---

## Verify SMTP Works (recommended deterministic test)

### Step 1 — Restart backend after env changes

If you changed any mail env variables, restart the backend once and ensure only one instance is running.

### Step 2 — Send a test message via the Contact API (PowerShell)

Run this **as a single command** in PowerShell (replace `<PORT>` and `<USER_EMAIL>`):

`Invoke-RestMethod -Method Post -Uri "http://localhost:<PORT>/api/contact" -ContentType "application/json" -Body '{"firstName":"Test","lastName":"Operator","email":"<USER_EMAIL>","message":"SMTP test"}'`

Expected success signals (all 3 should be true):

1. The API returns a success response that includes: `Message sent successfully`
2. Backend logs show a successful mail send (no auth/TLS error)
3. The target mailbox (the recipient configured by `MAIL_ADMIN`) receives the message

### Step 3 — Confirm delivery

- Check the inbox for the mailbox configured by `MAIL_ADMIN`.
- Also check Spam/Junk.

---

## Optional: Verify Newsletter Send Path (only if you are allowed)

Do this only if:

- you have admin credentials, and
- you have approval to send a newsletter test (even a test message can reach real users if misconfigured).

Recommendation:

- Prefer a “test mode” or a dedicated test recipient list if your system supports it.
- If not supported, do not run newsletter tests on production without explicit approval.

---

## If It Fails (common causes)

### A) API call fails (cannot reach backend)

- Backend is not running, or wrong port.
- Fix: confirm backend startup logs (HTTP vs HTTPS and which port).

### B) API returns error but backend is reachable

- Look at backend logs around the request time.
- Common env issues:
  - Missing `MAIL_HOST` / `MAIL_PORT`
  - Wrong `MAIL_USER` / `MAIL_PASS`

### C) SMTP auth failed

- Cause: wrong username/password, or provider requires an app password.
- Fix: re-check provider settings and rotate credentials if needed.

### D) TLS/SSL handshake problems

- Cause: wrong port (TLS vs STARTTLS), provider security requirements.
- Fix: confirm the correct SMTP port and security mode in provider docs (common ports: 587 STARTTLS, 465 TLS).

### E) Sender rejected

- Cause: `MAIL_FROM_EMAIL` not allowed by provider/domain policy.
- Fix: set `MAIL_FROM_EMAIL` to an address authorized by your SMTP provider, or remove it and rely on `MAIL_USER`.

### F) Email sent but not received

- Check Spam/Junk.
- Confirm `MAIL_ADMIN` points to the correct inbox.
- Check provider delivery logs (if available).

---

## Verified Code Anchors

- `server/services/emailService.js` — transporter config and send logic (`sendEmail`)
- `server/controllers/contactController.js` — contact endpoint handler
- `server/controllers/newsletterController.js` — newsletter send path
