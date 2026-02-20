# 05) Runtime and Restart (Production: Render + Vercel)

This runbook explains how to apply environment-variable changes and restart services safely
in the current production setup.

Current production setup:

- Backend: Render
- Frontend: Vercel

---

## Safety rules (P0)

- Never paste real secrets into docs, tickets, chat, screenshots, or commits.
- Do not restart services “randomly” during active user traffic if you can avoid it.
- After any environment-variable change, assume you must redeploy/restart the service for it to apply.
- Always run the health check after a restart (see `04-run-and-health-check.md`).

---

## Verified runtime reality (current deployment model)

- Backend is hosted on Render and runs as a managed service.
- Frontend is hosted on Vercel and runs as managed deployments.
- You do not need PM2/systemd/Windows service controls for production.

---

## Step 1 — Decide what you are changing

### A) Backend-only change (Render)

Examples:

- database variables (`DATABASE_*`)
- auth (`JWT_SECRET`, token TTLs)
- CORS (`CORS_ORIGINS`)
- Square (`SQUARE_*`)
- Mailgun SMTP (`MAIL_*`)
- Cloudinary (`CLOUDINARY_*`, `MEDIA_PROVIDER`)
- admin bootstrap (`ADMIN_*`)

Action:

- update env vars in Render → redeploy backend

### B) Frontend-only change (Vercel)

Examples:

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

Action:

- update env vars in Vercel → redeploy frontend

### C) Both frontend and backend change

Example:

- Google login setup requires both:
  - frontend `VITE_GOOGLE_CLIENT_ID`
  - backend `GOOGLE_CLIENT_ID`

Action:

- update backend first (Render) → redeploy backend
- update frontend second (Vercel) → redeploy frontend

---

## Step 2 — Backend restart / redeploy (Render)

### Apply environment-variable changes

1. Open Render Dashboard.
2. Select the CowboyLogic backend service.
3. Open Environment / Environment Variables.
4. Add/update variables using values from approved secret storage.

Important:

- If you rotate a secret (example: `JWT_SECRET`, `SQUARE_ACCESS_TOKEN`, `MAIL_PASS`),
  update only the runtime env store (Render), not docs.

### Redeploy the backend

After saving env changes:

1. Trigger a redeploy/restart of the Render service.
2. Open Render logs and confirm:
   - service starts successfully
   - database connects successfully
   - there are no “missing env var” errors

---

## Step 3 — Frontend redeploy (Vercel)

### Apply environment-variable changes

1. Open Vercel Dashboard.
2. Select the CowboyLogic frontend project.
3. Settings → Environment Variables.
4. Add/update variables (no secrets in frontend env).

### Redeploy the frontend

1. Trigger a new deployment (or redeploy the latest).
2. Confirm deployment succeeded.
3. Confirm the domain routing still points to `https://www.cowboylogic.net`.

---

## Step 4 — Post-restart verification (always)

After any backend redeploy, run:

Backend ping (PowerShell):

`(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net/api/square/_ping").StatusCode`

Expected:

- `204`

Optional static check:

`Invoke-RestMethod -Method Get -Uri "https://api.cowboylogic.net/__static_check"`

Expected:

- JSON includes `ok` (true)

After any frontend redeploy:

- open `https://www.cowboylogic.net`
- confirm the site loads and basic navigation works

---

## Failure patterns (what to do)

### Backend redeploy fails or crash-loops (Render)

Do this in order:

1. Open Render logs and capture the first error.
2. Common causes:
   - missing required env var
   - database connection failure (`DATABASE_*`)
   - invalid JSON/list formatting (example: `CORS_ORIGINS`)
3. Fix env values in Render and redeploy again.

Do not guess values.

### Frontend redeploy fails (Vercel)

Do this in order:

1. Open Vercel build logs.
2. Confirm env vars exist for the correct environment (Production vs Preview).
3. Fix env vars and redeploy.

---

## Notes about HTTPS and certificates

In this production model:

- HTTPS is terminated by Render/Vercel.
- Do not configure `SSL_KEY_PATH`, `SSL_CERT_PATH`, or `PORT_HTTPS` for Render deployments.

---

## Verified code anchors (for developers)

- `server/app.js`: ping and route wiring
- `server/server.js`: local HTTPS fallback logic (not used on Render)
