# 08) Square Operations (Operator Runbook)

This runbook explains how to:

- confirm Square checkout works,
- confirm Square can reach the webhook,
- diagnose common webhook/signature problems.

---

## Production webhook URL (fixed)

Webhook endpoint (backend):

- `https://api.cowboylogic.net/api/square/webhook`

Ping endpoint (backend reachability check):

- `https://api.cowboylogic.net/api/square/_ping`

---

## Required environment variables (production)

Set these in the backend environment (Render). Use placeholders in docs only.

- `SQUARE_ENV=production`
- `SQUARE_APPLICATION_ID=<SQUARE_APPLICATION_ID>`
- `SQUARE_ACCESS_TOKEN=<SQUARE_ACCESS_TOKEN>`
- `SQUARE_LOCATION_ID=LB1STCJM1BR20`

Webhook security (required):

- `SQUARE_WEBHOOK_SIGNATURE_KEY=<SQUARE_WEBHOOK_SIGNATURE_KEY>`
- `SQUARE_WEBHOOK_NOTIFICATION_URL=https://api.cowboylogic.net/api/square/webhook`

Redirect (important):

- `SQUARE_SUCCESS_URL=<PROD_SUCCESS_URL>`

Diagnostics:

- `ENABLE_SQUARE_DIAG=1`

Operational inbox:

- `ADMIN_ORDERS_EMAIL=info@cowboylogic.net`

Important:

- `SQUARE_SUCCESS_URL` must be the real production frontend success page, not localhost.
- Do not store secrets in the frontend environment.

---

## What is verified in code (source of truth)

- Checkout creation: `POST /api/square/create-payment` (mounted under `/api/square`)
- Webhook endpoint: `POST /api/square/webhook`
- Success redirect is taken from `SQUARE_SUCCESS_URL`
- Cancel redirect may not be configured in checkout options (behavior depends on current backend code)

---

## Daily operator checks (minimal)

1. Confirm the backend is reachable (fast)
   Run (PowerShell):

`(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net/api/square/_ping").StatusCode`

Expected:

- `204`

If not `204`, stop. Webhooks and checkout updates will not be reliable.

2. Confirm checkout starts from the website

- Open the website.
- Add an item to cart.
- Start checkout.

Expected:

- Browser redirects to a Square-hosted checkout page.

3. Confirm webhook delivery is healthy in Square Dashboard

- Open Square Dashboard → Webhooks / Webhook subscriptions.
- Find the production subscription.
- Check delivery logs.

Expected:

- deliveries show `2xx` success
- no repeated failures

---

## One-time setup: Square Dashboard webhook subscription

1. Open Square Dashboard.
2. Go to Webhooks / Webhook subscriptions.
3. Select the production webhook subscription (or create one).

Destination URL must be exactly:

- `https://api.cowboylogic.net/api/square/webhook`

Signature key:

- Copy the signature key for this subscription.
- Store it as:
  - `SQUARE_WEBHOOK_SIGNATURE_KEY=<SQUARE_WEBHOOK_SIGNATURE_KEY>`

Important rule:

- The exact destination URL string used in Square must match:
  - `SQUARE_WEBHOOK_NOTIFICATION_URL`
- Match must be exact (scheme/host/path/trailing slash).

---

## Send a Square test webhook (step-by-step)

1. Open Square Dashboard → Webhooks / Webhook subscriptions.
2. Select the production subscription.
3. Confirm Destination URL is exactly:
   - `https://api.cowboylogic.net/api/square/webhook`
4. Click “Send test event” / “Test webhook” (wording may vary).
5. Confirm results in two places:

A) Square delivery logs

- delivery result should be success (HTTP `2xx`)

B) Backend logs (Render)

- you should see an inbound webhook marker
- you should NOT see “Invalid Square signature”
- if you see “No SQUARE_WEBHOOK_SIGNATURE_KEY set” → misconfiguration

---

## Signature verification (fail-closed rule)

For production traffic, webhook signature verification must be enabled.

Required:

- `SQUARE_WEBHOOK_SIGNATURE_KEY` must be set in backend env
- `SQUARE_WEBHOOK_NOTIFICATION_URL` must exactly match Square Destination URL:
  - `https://api.cowboylogic.net/api/square/webhook`

---

## Troubleshooting (symptom → likely cause → fix)

### Symptom: Square delivery shows 404 Not Found

Likely cause:

- wrong URL path in Square subscription

Fix:

- Destination URL must end with exactly:
  - `/api/square/webhook`
- Do not use legacy paths like:
  - `/api/webhook/square`

---

### Symptom: Square delivery shows 401/403, or backend logs show signature error

Likely cause:

- URL mismatch used for signature calculation, or wrong signature key

Fix checklist (in order):

1. Confirm Square Destination URL is exactly:
   - `https://api.cowboylogic.net/api/square/webhook`
2. Confirm backend env var matches exactly:
   - `SQUARE_WEBHOOK_NOTIFICATION_URL=https://api.cowboylogic.net/api/square/webhook`
3. Confirm there is no trailing slash difference (avoid ending with `/`)
4. Confirm `SQUARE_WEBHOOK_SIGNATURE_KEY` belongs to this exact subscription
5. Redeploy/restart backend after env changes
6. Send a Square test webhook again

---

### Symptom: Backend logs show "No SQUARE_WEBHOOK_SIGNATURE_KEY set"

Likely cause:

- env var missing in Render

Fix:

- Set `SQUARE_WEBHOOK_SIGNATURE_KEY` in backend environment
- Redeploy backend
- Send a Square test webhook again

---

### Symptom: Checkout works, but webhook never arrives

Likely cause:

- Square cannot reach the endpoint or subscription is wrong environment

Fix (in order):

1. Confirm ping is healthy:
   - `https://api.cowboylogic.net/api/square/_ping` returns `204`
2. Confirm Square subscription Destination URL is correct
3. Confirm you are looking at the production subscription (not sandbox)

---

### Symptom: User returns to success page but app does not update order status

Likely causes:

- webhook delivery failing
- backend not processing webhook events correctly
- email/notification may still work independently

Fix:

1. Check Square delivery logs (must be `2xx`)
2. Check backend logs around webhook time
3. If `ENABLE_SQUARE_DIAG=1`, use the extra diagnostic logs to locate the failing step
4. Escalate to developer if webhook processing fails despite successful delivery

---

## Critical note: SQUARE_SUCCESS_URL must not be localhost in production

If production env contains:

- `SQUARE_SUCCESS_URL=http://localhost:5173/success`

This is wrong for production users.

Fix:

- Set `SQUARE_SUCCESS_URL=https://www.cowboylogic.net/success` (or the real prod success page you use)
- Redeploy backend

---

## Verified code anchors (source of truth)

- `server/controllers/squareController.js` (`createPaymentHandler`)
- `server/middleware/verifySquareSignature.js` (`verifySquareSignature`)
- `server/routes/squareRoutes.js` (route wiring under `/api/square`)
- `server/app.js` (webhook route path)
- `client/src/pages/CancelPage/CancelPage.jsx` (cancel UI behavior)
