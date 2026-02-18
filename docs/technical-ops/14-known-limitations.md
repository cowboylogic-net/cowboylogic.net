# 14) Known Limitations

This page lists **known, verified limitations** in the current CowboyLogic repo/runtime.
It is written for operators.

## How to use this page (operator workflow)

1. If a user reports a problem, find the matching section below.
2. Read **Impact** and **What you’ll see** to confirm it matches.
3. Follow **What to do** (safe, operator-level actions only).
4. If the issue blocks payments/login/production traffic: record it using `checklists/incident-template.md`.

---

## 1) Square cancel redirect is not configured

**Verified**

- Checkout options include **success redirect only**.
- Source: `server/controllers/squareController.js` (`checkoutOptions.redirectUrl`).

**Impact**

- When a customer cancels/backs out in Square, the app may not get a clean “cancel return” signal from Square itself.

**What you’ll see**

- Customer ends up on the app’s cancel handling page (if used by your UI), or manually returns to the site after canceling in Square.

**What to do**

- Use the UI cancel recovery path (app “Cancel” page returns user to cart).
  - Source: `client/src/pages/CancelPage/CancelPage.jsx` (redirect to `/cart`).
- If the customer is stuck: instruct them to open the site and go to **Cart** again.
- For operator verification, use:
  - `08-square-operations.md` (daily checks + webhook delivery)
  - `15-troubleshooting.md` (Square-related failure checklist)

---

## 2) Webhook route mismatch in legacy docs

**Verified**

- Active code route: `/api/square/webhook`
- Legacy docs may show: `/api/webhook/square`
- Sources:
  - `server/app.js` (active route)
  - `server/docs/api_endpoints.md` (legacy route text)

**Impact**

- If someone configures Square to the wrong webhook path, Square deliveries will fail.

**What you’ll see**

- Square Dashboard shows webhook delivery failures (non-2xx).
- Backend logs show no inbound webhook marker for the attempted delivery.

**What to do**

- Always configure Square webhook destination URL to:
  - `<PUBLIC_URL>/api/square/webhook`
- When using ngrok, also ensure:
  - `SQUARE_WEBHOOK_NOTIFICATION_URL` matches the exact same URL (scheme/host/path).
- Follow:
  - `07-ngrok-operations.md` (end-to-end ngrok steps and strict URL-change procedure)
  - `08-square-operations.md` (test webhook steps)

---

## 3) Production service manager is not codified in repo

**Verified**

- No committed PM2 ecosystem file, systemd unit, or Windows service config found in repo.

**Impact**

- The repo alone does not tell an operator **how production is started/stopped** on the real host.

**What you’ll see**

- Operators may not know whether the backend is run via PM2, a Windows service, systemd, or manual `npm start`.

**What to do**

- Do not guess. Use the method already used on the host.
- Record the actual host supervisor details in your internal ops notes (outside repo) once confirmed.
- Use safe baseline guidance:
  - `05-runtime-and-restart.md` (single-instance checks + safe restart baseline)
  - `appendix/minimal-stable-runtime.md` (recommended baseline runtime model)

---

## 4) Duplicate `VITE_API_URL` in client env example

**Verified**

- `client/.env.example` contains duplicate `VITE_API_URL` keys.

**Impact**

- Operators may set conflicting values; frontend may use the wrong API base URL.

**What you’ll see**

- Frontend loads, but API calls fail (often CORS/network errors) or point to an unexpected backend.

**What to do**

- In the real `client/.env`, keep **one** `VITE_API_URL`.
- After changing `VITE_API_URL`, restart the frontend dev server/build and re-test.
- See:
  - `03-first-time-setup.md`
  - `04-run-and-health-check.md`

---

## 5) Register redirect target not present in router

**Verified**

- Register code navigates to `/dashboard`, but frontend routes do not define `/dashboard`.
- Sources:
  - `client/src/components/RegisterForm/RegisterForm.jsx` (navigate call)
  - `client/src/App.jsx` (route list)

**Impact**

- After successful registration, the user may be sent to a page that does not exist.

**What you’ll see**

- A 404 / blank page / “route not found” after registration.

**What to do (safe operator actions)**

- Tell the user to open the site home page (`/`) and then go to Login (`/login`) if needed.
- Record it for developers as a product bug: “Register redirects to /dashboard but route is missing”.
- Do not attempt production hot-fixes as an operator unless your team explicitly instructs you.
