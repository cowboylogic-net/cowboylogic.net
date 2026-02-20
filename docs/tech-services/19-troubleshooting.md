# 19) Troubleshooting (Operator Playbook)

Use these quick actions in **strict order**.
This page provides **safe checks only**. Do not improvise.

## Operator safety rules (read first)

- Do **not** disable webhook signature verification in production.
- Do **not** share secrets via chat/email or paste them into documents.
- Do **not** edit the database unless a runbook explicitly says so **and you have a backup**.
- If payments or logins are broken for real users: record an incident using `checklists/incident-template.md`.

Related:

- `00-secret-hygiene.md`
- `14-env-reference.md`

---

## Production endpoints (current defaults)

- Frontend: `https://www.cowboylogic.net` (or `https://cowboylogic.net`)
- Backend API base: `https://api.cowboylogic.net`
- Backend ping: `GET https://api.cowboylogic.net/api/square/_ping` → expected `204`
- Backend static check: `GET https://api.cowboylogic.net/__static_check` → expected JSON `{ ok: true, ... }`
- Square webhook: `POST https://api.cowboylogic.net/api/square/webhook`

If you are troubleshooting a non-production environment, replace these URLs with the correct ones for that environment.

---

## Deterministic operator checks (PowerShell)

Run these from your machine.

- Backend reachable (any HTTP response is fine; timeout is not):
  - '(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net").StatusCode'

- Backend ping (must be 204):
  - '(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net/api/square/_ping").StatusCode'

- Static check (must contain `ok: true` and `uploadsDir`):
  - 'Invoke-RestMethod -Method Get -Uri "https://api.cowboylogic.net/__static_check"'

- Frontend reachable (any HTTP response is fine; timeout is not):
  - '(Invoke-WebRequest -Method Get -Uri "https://www.cowboylogic.net").StatusCode'

---

## A) Backend not starting / not reachable (P0)

### What you’ll see

- Backend deploy fails (Render), or `https://api.cowboylogic.net` times out.

### Do this (in order)

1. Check Render service status

- Render dashboard → backend service.
- Check **Deploy status** and **Logs**.
- If the last deploy failed: read the **first error** (often missing env or build failure).

2. Confirm required environment variables exist (Render)

- Render → backend service → Environment (or Environment Group).
- Verify required env keys exist (do not paste values).
- After changes: **redeploy/restart** backend.

3. Confirm backend health endpoints respond (deterministic)

- '(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net/api/square/_ping").StatusCode' → expected `204`
- 'Invoke-RestMethod -Method Get -Uri "https://api.cowboylogic.net/__static_check"' → expected `{ ok: true, ... }`

If ping/static check **times out**, treat as “service not running” or “DNS/network” (not an app bug).

### If still failing (common causes)

- Missing/incorrect env (DB creds, required secrets).
- DB connectivity issue (wrong host/user/pass/allowlist).
- DNS miswire for `api` (Cloudflare record points to wrong target).

**Related runbooks**

- `16-render-setup.md`
- `18-cloudflare-setup.md`
- `04-run-and-health-check.md`
- `06-database-operations.md`
- `14-env-reference.md`

---

## B) Frontend cannot call API (P1)

### What you’ll see

- Website loads, but actions fail (login, books, cart) with “Network error” / blocked requests.

### Do this (in order)

1. Confirm backend is healthy first (do not debug frontend before this)

- '(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net/api/square/_ping").StatusCode' → expected `204`

2. Confirm the frontend is pointing to the correct API base (Vercel)

- Vercel → Project → Environment Variables
- `VITE_API_URL` must be:
  - `https://api.cowboylogic.net`
- After change: redeploy frontend.

3. Confirm CORS allowlist contains the exact frontend origin (Render)

- Render env: `CORS_ORIGINS`
- It must include (comma-separated):
  - `https://www.cowboylogic.net`
  - `https://cowboylogic.net`
- After change: redeploy/restart backend.

4. If it works in Postman but not in browser

- That still points to CORS (browser-only enforcement). Fix `CORS_ORIGINS`.

**Related runbooks**

- `07-network-cors-https-uploads.md`
- `14-env-reference.md`
- `18-cloudflare-setup.md`

---

## C) Square webhook delivery fails (P0)

Payment-critical. Follow the exact order.

### What you’ll see

- Square dashboard shows webhook delivery failures, or orders don’t update after payment.

### Do this (in order)

1. Fail-fast: confirm backend is reachable publicly

- '(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net/api/square/_ping").StatusCode' → expected `204`
- If this fails, stop. Fix backend/DNS first.

2. Confirm webhook destination URL in Square Dashboard
   It must be exactly:

- `https://api.cowboylogic.net/api/square/webhook`

3. Confirm `SQUARE_WEBHOOK_NOTIFICATION_URL` matches exactly (Render env)
   If your signature verification uses a canonical URL, it must match Square’s destination **byte-for-byte**:

- same scheme `https://`
- same host
- same path `/api/square/webhook`
- same trailing slash behavior (prefer **no** trailing slash)

4. Confirm signature key is set (fail-closed)

- `SQUARE_WEBHOOK_SIGNATURE_KEY` must be set in backend env.
- Missing signature key is a production misconfiguration.

5. Send a Square test webhook

- Square Dashboard → Webhooks → send test event (for the correct subscription).
  Expected:
- Square reports success (2xx)
- Backend logs show inbound webhook marker
- No signature error

**Related runbooks**

- `08-square-operations.md`
- `15-known-limitations.md`
- `14-env-reference.md`

---

## D) Signature mismatch / “Invalid Square signature” (P0)

### Most common cause

- URL mismatch between:
  - Square Dashboard webhook destination URL
  - `SQUARE_WEBHOOK_NOTIFICATION_URL` (if used)
  - actual public backend URL

### Do this (in order)

1. Re-check exact URL match (scheme/host/path/trailing slash)

- Align Square Dashboard destination URL and `SQUARE_WEBHOOK_NOTIFICATION_URL` exactly.

2. Confirm `SQUARE_WEBHOOK_SIGNATURE_KEY` is correct for that webhook subscription

- Do not “try random secrets”.
- If rotated: update Render env and redeploy.

3. Redeploy/restart backend after env update

- Do not assume env changes apply without redeploy/restart.

4. Re-send a Square test webhook and confirm it succeeds

**Related runbooks**

- `08-square-operations.md`
- `00-secret-hygiene.md`
- `14-env-reference.md`

---

## E) Google login fails (P1)

### What you’ll see

- Google button missing, or Google login fails after clicking.
- Common error: `origin_mismatch`.

### Do this (in order)

1. Confirm frontend has Google Client ID (Vercel)

- `VITE_GOOGLE_CLIENT_ID` must be set.
- After changes: redeploy frontend.

2. Confirm backend has the same Google Client ID (Render)

- `GOOGLE_CLIENT_ID` must be set.
- It must match `VITE_GOOGLE_CLIENT_ID` (same OAuth client).
- After changes: redeploy backend.

3. Fix `origin_mismatch` (most common)
   Google Cloud Console → OAuth Client:

- Authorized JavaScript origins must include exactly:
  - `https://www.cowboylogic.net`
  - `https://cowboylogic.net`
  - `http://localhost:5173` (dev, optional)

Do not add random redirect URIs unless the backend flow explicitly uses them.

**Related runbooks**

- `09-google-login-setup.md`
- `14-env-reference.md`

---

## F) Admin cannot log in (P0/P1 depending on impact)

### What you’ll see

- Admin user cannot access admin pages or cannot log in.

### Do this (in order)

1. Confirm you are using the correct admin identity

- Use admin credentials from secret storage (do not guess).

2. If fully locked out

- Follow controlled recovery only with backup first.

**Related runbooks**

- `10-super-admin-access-recovery.md`
- `06-database-operations.md`
- `00-secret-hygiene.md`

---

## G) Mail not sending (P1)

### What you’ll see

- Contact form fails, or no emails arrive to the admin inbox.

### Do this (in order)

1. Confirm mail env exists (Render)
   Required keys:

- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`
- Recipient routing:
  - `MAIL_ADMIN` (preferred; do not rely on undocumented fallbacks)

If using Mailgun SMTP (common):

- `MAIL_HOST=smtp.mailgun.org`
- `MAIL_PORT=587` (STARTTLS) or `465` (TLS), depending on provider policy

2. Re-test via deterministic mail test

- Follow `12-mail-operations.md` exactly.

3. If still failing

- Check backend logs for:
  - connection timeout
  - authentication failed
  - TLS/SSL handshake issues
- If timeout persists, verify Mailgun region in Mailgun dashboard:
  - Some accounts use `smtp.eu.mailgun.org` (EU) instead of `smtp.mailgun.org` (US).
  - Do not switch blindly; confirm first.

**Related runbooks**

- `11-mailgun-setup.md`
- `12-mail-operations.md`
- `14-env-reference.md`

---

## H) Images not loading / broken public URLs (P1)

### What you’ll see

- Images return 404, or URLs point to `localhost` in production.

### Do this (in order)

1. Confirm `BASE_URL` in backend env is correct (Render)

- Should be `https://api.cowboylogic.net` for production.

2. Confirm the image URL host matches the expected system

- If the app uses Cloudinary for the asset, the URL should be a Cloudinary URL.
- If the app serves `/uploads/...`, the URL must start with `https://api.cowboylogic.net/uploads/...`.

3. Confirm static check endpoint is healthy

- 'Invoke-RestMethod -Method Get -Uri "https://api.cowboylogic.net/__static_check"'
  Expected:
- `ok: true`
- `uploadsDir` present

**Related runbooks**

- `07-network-cors-https-uploads.md`
- `13-cloudinary-setup.md`
- `14-env-reference.md`

---

## References (code anchors)

- `server/app.js` (routes and middleware wiring)
- `server/middleware/verifySquareSignature.js` (signature checks)
- `server/controllers/googleAuthController.js` (Google verification)
- `server/services/emailService.js` (SMTP transport)
