# 04) Run and Health Check

## Goal

Start the frontend and backend and confirm they are healthy using **simple, repeatable checks**.

---

## Before You Start (avoid the most common mistakes)

1. Make sure you are in the correct folder before running commands:

- Client must run from `client/`
- Server must run from `server/`

2. Confirm Node/NPM works:

- `node -v`
- `npm -v`

If either command fails, stop and install/fix Node.js before continuing.

---

## Start Client (Frontend)

1. Open PowerShell (or Terminal) in `client/`.

2. Start the client:

- `npm run dev`

3. What you should see:

- Vite starts without errors.
- It prints a local URL (example: `http://localhost:5173`).

If it fails:

- run `npm install` in `client/` and try again.

---

## Start Server (Backend)

### Option A — Development mode (most common for local work)

1. Open PowerShell in `server/`.

2. Start backend in dev mode:

- `npm run dev`

3. What you should see:

- Logs show DB connection success.
- Logs show the backend is listening (HTTP or HTTPS).

### Option B — “Server-like” mode (closer to production)

Use this when you want to run the backend like a service (no dev watcher).

1. Open PowerShell in `server/`.

2. Start backend:

- `npm start`

3. What you should see:

- Logs show one of these:
  - `HTTPS backend running on port ...` (HTTPS mode), or
  - `HTTP backend running on port ...` (HTTP fallback mode)

---

## How to Verify Listener Mode (read the logs)

- If logs include `HTTPS backend running on port` → HTTPS mode is active (uses `PORT_HTTPS`).
- If logs include `HTTP backend running on port` → HTTP fallback mode is active (uses `PORT`).

---

## Deterministic Health Checks (copy/paste)

### 1) Confirm the backend is actually listening on the port

If HTTP mode is active:

- `Get-NetTCPConnection -LocalPort <PORT> -State Listen`

If HTTPS mode is active:

- `Get-NetTCPConnection -LocalPort <PORT_HTTPS> -State Listen`

Expected:

- You see a listener entry.  
  If you see nothing, the backend did not start correctly.

---

### 2) Ping endpoint (must return 204)

If HTTP mode is active:

- `(Invoke-WebRequest -Method Get -Uri "http://localhost:<PORT>/api/square/_ping").StatusCode`

If HTTPS mode is active:

- `(Invoke-WebRequest -Method Get -Uri "https://localhost:<PORT_HTTPS>/api/square/_ping").StatusCode`

Expected:

- `204`

Note about HTTPS locally:

- If your machine does not trust the local cert, you may see a certificate warning/error.  
  In that case, use HTTP mode if available, or ask the team for the correct local TLS/trust setup.

---

### 3) Static check endpoint (must return ok + uploadsDir)

If HTTP mode is active:

- `Invoke-RestMethod -Method Get -Uri "http://localhost:<PORT>/__static_check"`

If HTTPS mode is active:

- `Invoke-RestMethod -Method Get -Uri "https://localhost:<PORT_HTTPS>/__static_check"`

Expected:

- Output contains `ok` (true) and `uploadsDir`.

---

## Verified Code Anchors (source of truth)

- `server/app.js`: route `GET /api/square/_ping`
- `server/app.js`: route `GET /__static_check`
- `server/server.js`: function `start` (HTTPS first, HTTP fallback)

---

## If It Fails (common cases)

### DB errors

- From `server/`: `npm run db:ping`
- Fix DB credentials/network first, then restart backend.

### No listener on the port

- Verify `PORT` / `PORT_HTTPS` values in `server/.env`.
- If HTTPS is expected, verify `SSL_KEY_PATH` and `SSL_CERT_PATH` files exist and are readable.
- Restart backend after changes.

### Frontend cannot call backend

- Verify backend is healthy first (checks above).
- Verify `CORS_ORIGINS` in `server/.env` (then restart backend).
- Verify `VITE_API_URL` in `client/.env` (then restart frontend).
