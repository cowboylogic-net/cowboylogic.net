# 04) Run and Health Check (Production: Vercel + Render)

## Goal

Confirm the frontend and backend are running and healthy using simple, repeatable checks.

Current production setup:

- Frontend: Vercel
- Backend: Render
- Public URLs:
  - Frontend: `https://www.cowboylogic.net`
  - Backend: `https://api.cowboylogic.net`

---

## Safety rules

- Do not paste secrets into docs, tickets, chat, screenshots, or commits.
- For production, do not run local start commands as a “fix”.
  Use Vercel/Render dashboards for deploy/restart.

---

## Production health checks (copy/paste)

### 1) Frontend is reachable (browser)

1. Open:
   - `https://www.cowboylogic.net`
2. Expected:
   - page loads without a blank screen
   - navigation works (basic click-through)

If the site does not load:

- check Vercel deployment status (see “Where to check logs” below)

---

### 2) Backend ping must return 204 (PowerShell)

Run:

`(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net/api/square/_ping").StatusCode`

Expected:

- `204`

If you do not get `204`:

- open Render logs and look for startup errors (DB/auth/env)
- confirm the backend service is deployed and running

---

### 3) Optional: static check endpoint (PowerShell)

Use this to quickly confirm the backend is responding with diagnostic JSON.

Run:

`Invoke-RestMethod -Method Get -Uri "https://api.cowboylogic.net/__static_check"`

Expected:

- JSON includes `ok` (true)

Notes:

- This endpoint may expose operational details (example: uploads directory).
- If your team decides it should not be public, remove/lock it in code and update this runbook.

---

## Where to check logs (production)

### Backend logs (Render)

1. Open Render Dashboard.
2. Select the CowboyLogic backend service.
3. Open **Logs**.

What you should see after a deploy/restart:

- service starts successfully
- database connects successfully (example: “MySQL connected via Sequelize”)
- no “missing env var” errors

---

### Frontend deploy logs (Vercel)

1. Open Vercel Dashboard.
2. Select the CowboyLogic frontend project.
3. Open the latest deployment and review build output.

What you should see:

- build succeeded
- deployed to `https://www.cowboylogic.net` (or equivalent mapped domain)

---

## Restart / redeploy rules (production)

If you changed environment variables:

- Backend env changed (Render):
  - redeploy/restart the Render backend service
- Frontend env changed (Vercel):
  - redeploy the Vercel frontend project

Do not assume env changes apply without a redeploy/restart.

---

## What “healthy” means (minimum)

The system is considered minimally healthy if:

- Frontend loads: `https://www.cowboylogic.net`
- Backend ping returns `204`: `/api/square/_ping`

Feature checks (separate runbooks):

- Google login: see `micro-services/google-login.md`
- Mail sending (Mailgun): see `micro-services/mailgun.md`
- Cloudinary uploads: see `micro-services/cloudinary.md`
- Square webhooks: see `micro-services/square-webhooks.md`

---

## Verified code anchors (for developers)

- `server/app.js`: route `GET /api/square/_ping`
- `server/app.js`: route `GET /__static_check`
- `server/server.js`: startup / listener wiring

---
