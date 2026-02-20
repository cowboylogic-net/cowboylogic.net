# 14) Known Limitations (Production: Vercel + Render + Cloudinary)

This page lists known limitations and “gotchas” that can affect operators in the current deployment.

Production setup (expected):

- Frontend: Vercel → `https://www.cowboylogic.net` (also `https://cowboylogic.net`)
- Backend: Render → `https://api.cowboylogic.net`
- Images: Cloudinary (media provider)

## How to use this page (operator workflow)

1. If a user reports a problem, find the matching section below.
2. Read **Impact** and **What you’ll see** to confirm it matches.
3. Follow **What to do** (safe operator-level actions only).
4. If the issue blocks payments/login/production traffic: treat as an incident.

---

## 1) Square “cancel redirect” is not configured (success-only redirect)

**Known limitation**

**Impact**

- If a customer cancels/bails out on Square checkout, the app may not receive a clean “cancel return” from Square itself.

**What you’ll see**

- Customer closes the Square page, or ends up back on the site without a clear “cancel” confirmation step.

**What to do**

- Tell the customer to open the site and return to **Cart** and try again.
- If they paid but order status did not update: treat as a webhook/delivery issue and follow section (2).

---

## 2) Square webhook URL + signature verification require an exact match

**Known limitation (strict requirement)**

Webhook destination (production) must be exactly:

- `https://api.cowboylogic.net/api/square/webhook`

**Impact**

- If the webhook URL differs by even one character (scheme/host/path/trailing slash), Square deliveries may fail and/or signature verification can fail.

**What you’ll see**

- Square dashboard shows delivery failures (non-2xx), OR
- backend logs show a signature error (example: “Invalid Square signature”), OR
- payments complete on Square but the app does not finalize the order.

**What to do**

1. In Square Dashboard, set the webhook destination URL to:
   - `https://api.cowboylogic.net/api/square/webhook`
2. In backend environment (Render), set:
   - `SQUARE_WEBHOOK_NOTIFICATION_URL=https://api.cowboylogic.net/api/square/webhook`
   - `SQUARE_WEBHOOK_SIGNATURE_KEY=<SQUARE_WEBHOOK_SIGNATURE_KEY>`
3. Redeploy/restart the backend service on Render.
4. Re-test webhook delivery using Square “test event” tools (if available).

Operator warning:

- Do not add a trailing slash.
- Do not use legacy paths like `/api/webhook/square`.

---

## 3) Old images may be broken after moving to Cloudinary (data migration gap)

**Known limitation (data, not code)**

**Impact**

- Books/pages that still reference old local file URLs (example: `/uploads/...`) will show broken images in production.
- Those old files are not automatically available on Cloudinary.

**What you’ll see**

- Image placeholders or 404s when opening old content.
- URLs that look like `/uploads/...` or point to a server filesystem path.

**What to do**

- Re-upload the missing images using the admin UI so the new Cloudinary URL is stored.
- If you have only a small number of broken images: manually re-upload and save each record.
- Do not treat this as a hosting outage if the rest of the site works.

---

## 4) Local filesystem uploads are not a reliable storage model on Render

**Known limitation (hosting reality)**

**Impact**

- If a feature still tries to store files only on the backend filesystem, files may not persist reliably across redeploys/restarts.

**What you’ll see**

- Upload “succeeds” but later the file is missing, OR
- images load in one session but disappear after a backend redeploy.

**What to do**

- Ensure Cloudinary is the active media provider:
  - `MEDIA_PROVIDER=cloudinary`
  - `CLOUDINARY_CLOUD_NAME=<...>`
  - `CLOUDINARY_API_KEY=<...>`
  - `CLOUDINARY_API_SECRET=<...>`
- Prefer Cloudinary URLs as the only public image source.

---

## 5) Google login “origin_mismatch” happens when authorized origins are incomplete

**Known limitation (configuration sensitivity)**

**Impact**

- Google Sign-In will fail in production if Google Cloud Console does not include the exact frontend origins.

**What you’ll see**

- Google popup error like `origin_mismatch`
- Google button appears but login fails immediately

**What to do**

1. In Google Cloud Console OAuth client settings (Web client), add **Authorized JavaScript origins**:
   - `https://www.cowboylogic.net`
   - `https://cowboylogic.net`
2. Confirm the same Google Client ID is set in both:
   - Frontend (Vercel): `VITE_GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`
   - Backend (Render): `GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`
3. Redeploy backend and frontend after env changes.

Note:

- Redirect URIs may be required by Google Console UI policies, but this app uses an ID token flow.
  Do not “guess” redirect URIs; add only the real production URLs you use.

---

## 6) Duplicate `VITE_API_URL` key in env example can cause wrong API host

**Known limitation (documentation/config drift)**

**Impact**

- Operators may accidentally keep two `VITE_API_URL` lines; the frontend can end up calling the wrong backend.

**What you’ll see**

- Site loads but API actions fail, OR network calls go to an unexpected host.

**What to do**

- In the real frontend environment values, keep exactly **one**:
  - `VITE_API_URL=https://api.cowboylogic.net`
- Redeploy on Vercel after changing env values.

---

## 7) `GOOGLE_CLIENT_SECRET` exists but may not be used by the current runtime flow

**Known limitation (confusion risk)**

**Impact**

- Operators may assume Google login requires the client secret and block on it unnecessarily.

**What you’ll see**

- Google login fails for reasons unrelated to the secret (most often origin mismatch or client ID mismatch).

**What to do**

- Treat `GOOGLE_CLIENT_ID` as required.
- Store `GOOGLE_CLIENT_SECRET` securely anyway, but do not treat it as the first-line root cause unless code changes later.

---

## 8) Legacy “ngrok / direct HTTPS / PM2” operational docs are obsolete in this production model

**Known limitation (documentation drift)**

**Impact**

- Older runbooks can mislead operators into changing the wrong things (ports, local SSL files, tunnels).

**What you’ll see**

- Instructions referencing:
  - ngrok URLs
  - local `PORT_HTTPS`, `SSL_KEY_PATH`, `SSL_CERT_PATH`
  - PM2/systemd service management

**What to do**

- For production operations, use Render/Vercel procedures:
  - restart/redeploy via Render (backend)
  - redeploy via Vercel (frontend)
- Do not apply local-host instructions to production.
