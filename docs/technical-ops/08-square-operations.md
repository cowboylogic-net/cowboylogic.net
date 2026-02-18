# 08) Square Operations (Operator Runbook)

This runbook is for a technical operator. It explains how to:

- confirm checkout works,
- confirm Square can reach your webhook,
- diagnose the most common webhook/signature problems.

---

## What Is Verified in Code (Source of Truth)

- Checkout creation: `POST /api/square/create-payment` (mounted under `/api/square`)
- Webhook endpoint: `POST /api/square/webhook`
- Success redirect source: `SQUARE_SUCCESS_URL` (backend uses it when creating checkout)
- Cancel redirect: **not configured** in backend checkout options (known limitation)

---

## What You Must Have Before You Start

1. A working **public URL** that can reach your backend from the internet (usually ngrok).

- Example: `https://<YOUR_TUNNEL>.ngrok-free.app`
- You must be able to open: `<PUBLIC_URL>/api/square/_ping` and get HTTP `204`

2. Access to:

- Square Dashboard (to view webhooks + delivery logs + send test events)
- Backend environment variables (to set `SQUARE_WEBHOOK_NOTIFICATION_URL`, `SQUARE_WEBHOOK_SIGNATURE_KEY`, etc.)
- Backend logs (to confirm webhook arrived)

If you do not have these accesses, stop and escalate.

---

## Key Terms (Avoid Confusion)

There are **three** URLs that must line up correctly:

1. **Public URL** (ngrok):

- Example: `https://abcd-123.ngrok-free.app`

2. **Square Webhook Destination URL** (in Square Dashboard):

- Must be exactly: `<PUBLIC_URL>/api/square/webhook`

3. **Backend variable `SQUARE_WEBHOOK_NOTIFICATION_URL`**:

- Must be exactly the same string as the Square Destination URL:
- `SQUARE_WEBHOOK_NOTIFICATION_URL=<PUBLIC_URL>/api/square/webhook`

If any of these differ (scheme/host/path/trailing slash), signature verification can fail.

---

## Daily Operator Checks (Minimal)

1. Checkout creation works (from the site):

- Start a test checkout from the cart flow (authenticated user).
- Expected: browser redirects to a Square-hosted checkout page.

2. Square webhook delivery works:

- In Square Dashboard, confirm webhook deliveries are `2xx` (success).
- In backend logs, confirm there is an inbound webhook marker and **no signature error**.

3. App outcome looks correct:

- Confirm the order/payment status in the app is updated as expected after payment.
  (Exact UI wording may differ; the key is “payment confirmed” behavior is visible.)

---

## Fail-Fast: Confirm Backend Is Publicly Reachable (Do This First)

From your machine, open or request:

- `<PUBLIC_URL>/api/square/_ping`

Expected:

- HTTP `204 No Content`

If you cannot get `204`, do **not** test Square webhooks yet. Fix your tunnel/URL first (see `07-ngrok-operations.md`).

---

## Send a Square Test Webhook (Step-by-Step)

1. Open Square Dashboard in a browser.
2. Navigate to the Webhooks area:

- Look for a section like `Developer`, `Webhooks`, or `Webhook Subscriptions`.

3. Select the correct webhook subscription (the one used for this environment).

4. Confirm the Destination URL is exactly:

- `<PUBLIC_URL>/api/square/webhook`

5. Use Square’s “send test event” / “test webhook” / “deliver test” tool for that subscription.

- Choose any available test event type (does not matter for connectivity/signature testing).

6. Confirm results in two places:

A) Square side (delivery logs)

- Delivery result should show success (HTTP `2xx`)

B) Backend side (logs)

- You should see an inbound webhook marker
- You should NOT see signature errors such as “Invalid Square signature”
- If you see `No SQUARE_WEBHOOK_SIGNATURE_KEY set`, treat as a production misconfiguration.

---

## Signature Verification (Fail-Closed Rule)

Webhook signature verification must be enabled for production traffic.
If signature verification is missing/disabled/misconfigured, treat it as a P0 operational issue.

Required:

- `SQUARE_WEBHOOK_SIGNATURE_KEY` must be set in backend env
- `SQUARE_WEBHOOK_NOTIFICATION_URL` must exactly match the Square Destination URL

---

## Troubleshooting (Symptom → Likely Cause → Fix)

### Symptom: Square delivery shows `404` or `Not Found`

Likely cause:

- Wrong path or wrong base URL

Fix:

- Destination URL must end with exactly: `/api/square/webhook`
- Do not use legacy paths such as `/api/webhook/square`

---

### Symptom: Square delivery shows `401/403` or signature error in backend logs

Likely cause:

- URL mismatch used for signature calculation, or wrong signature secret

Fix checklist (in this order):

1. Confirm Square Destination URL is exactly: `<PUBLIC_URL>/api/square/webhook`
2. Confirm backend `SQUARE_WEBHOOK_NOTIFICATION_URL` is exactly the same string
3. Confirm scheme matches (`https` vs `http`)
4. Confirm no trailing slash differences (avoid ending with `/`)
5. Confirm `SQUARE_WEBHOOK_SIGNATURE_KEY` matches the secret for this subscription in Square Dashboard
6. Restart backend after env changes, then re-test webhook delivery

---

### Symptom: Backend logs show `No SQUARE_WEBHOOK_SIGNATURE_KEY set`

Likely cause:

- Missing env var in runtime environment

Fix:

- Set `SQUARE_WEBHOOK_SIGNATURE_KEY` in the backend runtime environment
- Restart backend
- Re-send a Square test webhook and confirm signature passes

---

### Symptom: Checkout redirects work, but webhook never arrives

Likely cause:

- Square cannot reach your webhook endpoint publicly

Fix:

1. Confirm `<PUBLIC_URL>/api/square/_ping` returns `204`
2. Confirm Square Destination URL uses that same `<PUBLIC_URL>`
3. If using ngrok free plan, URL changes on restart:
   - Follow `07-ngrok-operations.md` “ngrok URL changed” strict procedure

---

## Known Limitation and Workaround (Verified)

Limitation:

- Backend sets success redirect only (no cancel redirect configured in checkout options)

Workaround:

- Use website cart recovery path (`/cancel` UI flow returns the user back to cart)

---

## How to Verify Checkout Creation (Operator-Level)

1. Trigger checkout from the cart as an authenticated user.
2. Expected:

- Backend returns a response containing `checkoutUrl`
- Browser redirects to Square checkout

If checkout creation fails:

- Check backend logs for Square API errors
- Confirm `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, and `SQUARE_SUCCESS_URL` are set in runtime env

---

## Verified Code Anchors (Source of Truth)

- `server/controllers/squareController.js` (`createPaymentHandler`)
- `server/middleware/verifySquareSignature.js` (`verifySquareSignature`)
- `server/routes/squareRoutes.js` (route wiring under `/api/square`)
- `server/app.js` (webhook route path)
- `client/src/pages/CancelPage/CancelPage.jsx` (cancel UI behavior)
