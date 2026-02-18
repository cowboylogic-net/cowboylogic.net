# 12) Network, CORS, HTTPS, Uploads

This runbook helps an operator diagnose and fix the most common deployment problems:

- browser blocked requests (CORS),
- HTTP vs HTTPS confusion,
- broken image/public URLs (BASE_URL),
- file uploads failing (permissions / directory).

---

## Quick Terms (plain language)

- **CORS**: browser security rule. If misconfigured, the browser blocks requests even if the server works.
- **BASE_URL**: what the backend uses to build absolute public URLs (for images/links). This does **not** fix CORS.
- **HTTPS**: encrypted server mode. This app tries HTTPS first (if cert/key work), otherwise it falls back to HTTP.
- **UPLOADS_DIR**: where uploaded files are stored on disk and then served publicly from `/uploads/...`.

---

## Before You Start (fail fast)

1. Confirm backend is running.
2. Confirm which listener is active:

- HTTP: `http://localhost:<PORT>`
- HTTPS: `https://localhost:<PORT_HTTPS>`

3. Confirm backend responds (PowerShell):

`(Invoke-WebRequest -Method Get -Uri "http://localhost:<PORT>/api/square/_ping").StatusCode`

Expected: `204`

If HTTPS is active, use:

`(Invoke-WebRequest -Method Get -Uri "https://localhost:<PORT_HTTPS>/api/square/_ping" -SkipCertificateCheck).StatusCode`

Expected: `204`

---

## CORS (Browser requests blocked)

### What to set

`CORS_ORIGINS` must contain the **frontend origin(s)** as a comma-separated list.

Examples:

- Local dev: `http://localhost:5173`
- Production: `https://your-domain.com`
- If you use an ngrok frontend URL: include that origin too (the `https://xxxx.ngrok-free.app` origin)

Important:

- Use **origins**, not full URLs with paths.
  - Good: `https://example.com`
  - Bad: `https://example.com/shop/cart`

### Minimal operator procedure

1. Set `CORS_ORIGINS` (comma-separated).
2. Restart backend.
3. Test from the browser again.

### Deterministic check (PowerShell preflight)

Replace `<ORIGIN>` with your frontend origin (example: `http://localhost:5173`):

`Invoke-WebRequest -Method Options -Uri "http://localhost:<PORT>/api/square/_ping" -Headers @{ Origin="<ORIGIN>"; "Access-Control-Request-Method"="GET" }`

Expected:

- Status is typically `204` or `200`
- Response headers should include `Access-Control-Allow-Origin` matching your origin (or an allowed pattern)

### If it fails (common symptoms)

- **Browser console shows**: “CORS policy: No 'Access-Control-Allow-Origin'”
  - Cause: origin not in `CORS_ORIGINS`
  - Fix: add the exact origin and restart backend

- **Works in Postman but not in browser**
  - Cause: CORS applies to browsers only
  - Fix: same as above (CORS_ORIGINS)

---

## BASE_URL (Broken public URLs / images)

### When you need it

Set `BASE_URL` when the backend generates **absolute** URLs (for example: public image URLs or links in emails).

Examples:

- Production: `https://your-domain.com`
- ngrok backend: `https://<YOUR_BACKEND_NGROK_HOST>`

Rules:

- Must include scheme: `http://` or `https://`
- Must be the backend’s public base, not the frontend URL (unless they are the same host)

### Operator check

1. Set `BASE_URL` (if required by your deployment).
2. Restart backend.
3. Create/inspect a record that includes a generated public URL (for example an uploaded image URL).
4. Confirm the URL opens in a browser and points to your backend host.

Common symptom:

- URLs start with `http://localhost:...` in production emails/pages
  - Fix: set `BASE_URL` to the real public backend URL and restart backend

---

## HTTPS and SSL (HTTP vs HTTPS mode)

### What to set for direct HTTPS mode

- `PORT_HTTPS`
- `SSL_KEY_PATH`
- `SSL_CERT_PATH`

Verified behavior:

- If cert/key files cannot be read, backend falls back to HTTP.

### Operator checks (PowerShell)

1. Confirm files exist (replace paths):

`Test-Path "<SSL_KEY_PATH>"`
`Test-Path "<SSL_CERT_PATH>"`

Expected: `True` for both.

2. If files exist but HTTPS still fails:

- Check file permissions for the service account running the backend.
- Check backend logs for SSL read/parse errors.

3. Confirm active mode via health check:

- If HTTPS works:
  - `https://localhost:<PORT_HTTPS>/api/square/_ping` returns `204`
- If HTTPS fails and HTTP is active:
  - `http://localhost:<PORT>/api/square/_ping` returns `204`

Note:

- Local HTTPS testing may require ignoring local certificate warnings.
  - In PowerShell: add `-SkipCertificateCheck` for local-only checks.

---

## Uploads Directory (files not saving / images not loading)

### What is required

1. Backend must be able to **write** to `UPLOADS_DIR`.
2. Backend must serve uploads publicly from `/uploads/...` (static mount).
3. The uploads directory must exist or be creatable by the backend process.

### Minimal operator procedure

1. If you use a custom folder, set `UPLOADS_DIR`.
2. Restart backend.
3. Test an upload from the UI.
4. Open the uploaded file URL in a browser:
   - It should look like: `<BASE_URL>/uploads/<file>`

### Deterministic checks (PowerShell)

1. Check the folder exists (replace path):

`Test-Path "<UPLOADS_DIR>"`

2. Check you can create a file (write permission test):

`New-Item -Path "<UPLOADS_DIR>\_write_test.txt" -ItemType File -Force | Out-Null; Test-Path "<UPLOADS_DIR>\_write_test.txt"`

Expected: `True`

(Then remove it:)

`Remove-Item -Path "<UPLOADS_DIR>\_write_test.txt" -Force`

### If it fails (common symptoms)

- **Upload API returns 500 / permission denied**
  - Cause: backend process cannot write to `UPLOADS_DIR`
  - Fix: correct folder permissions or change `UPLOADS_DIR` to a writable path

- **Upload succeeds but image URL is 404**
  - Cause: uploads not served, wrong `BASE_URL`, or static mount mismatch
  - Fix: verify static mount exists (see code anchors) and ensure URL host matches backend public host

- **Nested folders missing**
  - Verified: middleware may auto-create subdirectories
  - Fix: ensure the top-level `UPLOADS_DIR` is writable

---

## Verified Code Anchors

- `server/app.js` — CORS config and uploads static mount
- `server/server.js` — HTTPS-first startup with HTTP fallback
- `server/config/publicBase.js` — public base URL resolver
- `server/middleware/uploadMiddleware.js` — directory creation + upload pipeline
- `server/config/imageConfig.js` — upload base path selection

---

## Troubleshooting Index (symptom → likely cause)

- Browser blocked (CORS) → `CORS_ORIGINS` missing origin
- Links/images point to localhost in prod → `BASE_URL` not set or wrong
- HTTPS not available → wrong SSL paths or permissions, fallback to HTTP
- Upload fails → `UPLOADS_DIR` not writable
- Upload URL 404 → static mount/BASE_URL mismatch
