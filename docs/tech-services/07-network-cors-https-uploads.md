# 12) Network, CORS, HTTPS, Uploads (Vercel + Render + Cloudinary)

This runbook helps an operator diagnose and fix the most common production issues:

- browser blocked requests (CORS),
- wrong frontend/backed URLs,
- HTTPS confusion,
- images not showing (Cloudinary vs local uploads),
- webhook reachability (Square) basics.

Production URLs (expected):

- Frontend: `https://www.cowboylogic.net` (also `https://cowboylogic.net`)
- Backend: `https://api.cowboylogic.net`

---

## Quick terms (plain language)

- **Origin**: the website base like `https://www.cowboylogic.net` (no paths).
- **CORS**: a browser rule. If it is wrong, the browser blocks API calls even when the server is working.
- **HTTPS**: encrypted traffic. In this setup, HTTPS is handled by Vercel/Render.
- **Cloudinary**: the image storage service. Images should load from Cloudinary URLs.
- **Uploads**: creating/storing images (in production this should use Cloudinary).

---

## Before you start (fail fast)

1. Confirm the website loads:

- Open `https://www.cowboylogic.net`

2. Confirm the backend is reachable (PowerShell):

`(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net/api/square/_ping").StatusCode`

Expected:

- `204`

If you do not get `204`:

- check Render service status and logs first (restart/redeploy if needed)

---

## A) CORS (browser blocks API calls)

### What you will see

In the browser console, errors like:

- “CORS policy: No 'Access-Control-Allow-Origin'…”
- Network calls failing even though the backend is up

### What to set

Backend variable:

- `CORS_ORIGINS` must contain the exact frontend origin(s), comma-separated.

Production value should include:

- `https://cowboylogic.net`
- `https://www.cowboylogic.net`

Example:

- `CORS_ORIGINS=https://cowboylogic.net,https://www.cowboylogic.net`

Rules:

- Origins only (no paths)
  - Good: `https://www.cowboylogic.net`
  - Bad: `https://www.cowboylogic.net/shop/cart`
- Match scheme + host exactly (https vs http)

### Minimal operator procedure (production)

1. Open Render → backend service → Environment Variables.
2. Set `CORS_ORIGINS` correctly (comma-separated).
3. Redeploy/restart the backend service on Render.
4. Re-test in the browser.

### Deterministic preflight check (PowerShell)

This simulates what browsers do (OPTIONS preflight).

`Invoke-WebRequest -Method Options -Uri "https://api.cowboylogic.net/api/square/_ping" -Headers @{ Origin="https://www.cowboylogic.net"; "Access-Control-Request-Method"="GET" }`

Expected:

- HTTP status `200`/`204` (varies by server)
- Response headers include:
  - `Access-Control-Allow-Origin: https://www.cowboylogic.net` (or an allowed form)

If it fails:

- `CORS_ORIGINS` is missing the exact origin
- or backend is not running/redeployed

---

## B) Wrong backend URL used by the frontend

### What you will see

- The site loads, but login/books/cart actions fail.
- Network calls go to the wrong host (example: localhost).

### What to check

Frontend variable in Vercel:

- `VITE_API_URL=https://api.cowboylogic.net`

Rules:

- no trailing slash
- must be the backend public URL

Minimal procedure:

1. Open Vercel → Project → Settings → Environment Variables.
2. Set `VITE_API_URL` correctly.
3. Redeploy the frontend.

---

## C) HTTPS (what matters in this setup)

### Key point

In production:

- Vercel and Render handle HTTPS.
- Do not use local certificate file variables for production hosting.

Do NOT rely on these for Render production:

- `SSL_KEY_PATH`
- `SSL_CERT_PATH`
- `PORT_HTTPS`

If you see these set in env:

- treat them as legacy
- remove them from production env unless your team explicitly requires them for a different hosting model

---

## D) Uploads and images (Cloudinary vs local `/uploads`)

### Current production expectation (Cloudinary)

If `MEDIA_PROVIDER=cloudinary`:

- images should be stored and served from Cloudinary
- image URLs should look like Cloudinary URLs (example pattern):
  - `https://res.cloudinary.com/<CLOUDINARY_CLOUD_NAME>/...`

In this mode:

- `/uploads/...` should not be the main public image source
- local filesystem paths are not a reliable long-term store on Render

### What to set (backend env)

Cloudinary variables:

- `MEDIA_PROVIDER=cloudinary`
- `CLOUDINARY_CLOUD_NAME=<CLOUDINARY_CLOUD_NAME>`
- `CLOUDINARY_API_KEY=<CLOUDINARY_API_KEY>`
- `CLOUDINARY_API_SECRET=<CLOUDINARY_API_SECRET>`

### How to verify (operator)

1. Perform an upload in the admin UI (example: book cover).
2. After saving, refresh the page.
3. Confirm the image URL:

- starts with `https://res.cloudinary.com/`
- loads in a browser tab

If the upload fails:

- check Render logs for Cloudinary errors (auth/permissions/network)
- confirm the three Cloudinary env values are present and correct
- redeploy backend after fixing env

### About `UPLOADS_DIR` in Cloudinary mode

`UPLOADS_DIR` may still exist for temporary processing, but it should not be the source of public image URLs.

If your backend requires `UPLOADS_DIR`:

- set it to a safe, writable temporary folder supported by the host
- do not use Windows paths on Render

Use a placeholder in docs:

- `UPLOADS_DIR=<TEMP_UPLOAD_PATH>`

---

## E) BASE_URL (public links built by backend)

`BASE_URL` is used when the backend needs to build absolute links (example: links inside emails).

Production value:

- `BASE_URL=https://api.cowboylogic.net`

Rules:

- must include `https://`
- must be the backend public host

If you see emails or links pointing to `http://localhost:...`:

- set `BASE_URL` correctly in Render
- redeploy backend
- re-test the email flow

---

## Verified code anchors (for developers)

- `server/app.js` — CORS config and routes
- `server/app.js` — `GET /api/square/_ping`
- `server/config/publicBase.js` — BASE_URL resolver (if used)
- `server/config/imageConfig.js` — media provider selection (Cloudinary vs local)
- `server/middleware/uploadMiddleware.js` — upload pipeline (if used)

---

## Troubleshooting index (symptom → likely cause)

- Browser blocked (CORS) → `CORS_ORIGINS` missing `https://www.cowboylogic.net`
- Site uses wrong API host → Vercel `VITE_API_URL` wrong or not redeployed
- Backend not reachable → Render service down / deploy failed
- Images broken or 404 → Cloudinary env missing/wrong OR old data still points to `/uploads`
- Emails include localhost links → `BASE_URL` not set correctly
