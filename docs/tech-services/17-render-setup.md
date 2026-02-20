# 16) Render Setup (Backend)

This runbook explains how to deploy the CowboyLogic **backend** to Render using the GitHub-connected workflow.

Operator audience: technical operator (not a developer).

---

## Safety Rules (P0)

- Never paste real secrets into docs/chat/tickets/screenshots/commits.
- Do not copy values from `.env.example` (assume examples may be compromised).
- Use secret storage as the source of truth.
- After any env change: redeploy/restart backend and re-run health checks.

Related:

- `00-secret-hygiene.md`
- `14-env-reference.md`

---

## Goal

- Backend is deployed on Render as a **Web Service**.
- Auto-deploys from GitHub branch (usually `main`).
- Has correct environment variables (DB, auth, Square, Google, mail, Cloudinary).
- Serves public API on `https://api.cowboylogic.net` (custom domain).

---

## Prerequisites

You must have:

1. **GitHub repo access**
   - Repo: `https://github.com/cowboylogic-net/cowboylogic.net`
   - Permission to connect it to Render.

2. **Render account access**
   - Permission to create/modify services + environment variables (or environment groups).
   - `ADMIN_EMAIL=<ADMIN_EMAIL>`
   - `ADMIN_PASSWORD=<ADMIN_PASSWORD>`

3. **Secret storage access**
   - You can read the production values without copying them into documents.

4. **Cloudflare access (DNS)**
   - For mapping `api.cowboylogic.net` to Render.
   - Cloudflare will be documented separately, but Render setup depends on it.

Related:

- `02-access-prerequisites.md`

---

## Step 1 — Create the Render Web Service (GitHub-connected)

1. Open Render Dashboard → **New** → **Web Service**.
2. Choose **Build and deploy from a Git repository**.
3. Connect GitHub (if not connected yet).
4. Select repo: `cowboylogic-net/cowboylogic.net`.
5. Choose branch: `main` (or your production branch).

---

## Step 2 — Set Root Directory + Build/Start Commands (monorepo)

Because the repo contains both client and server, make sure Render runs **server**.

In the Render service settings:

- **Root Directory**: `server`

Commands (baseline):

- **Build Command**: `npm ci`
  - If `npm ci` fails due to missing lockfile, use: `npm install`
- **Start Command**: `node server.js`
  - If your service was previously running with `node server.js`, keep it consistent.

Runtime:

- **Runtime**: Node

Node version:

- If deploy fails due to Node version mismatch, set Render’s Node version to match your project.
  - If your team uses a `NODE_VERSION` env var, set it there.
  - Otherwise set `engines` in `server/package.json` (dev-owned change; do not improvise as operator).
  - Do not guess: match the last known-good production deploy.

---

## Step 3 — Configure Environment Variables (Render)

### Recommended: use an Environment Group

If you already have an Environment Group, add variables there and attach it to the service.

- Render → **Environment Groups** → select your group → **Edit**
- Add/update variables (values from secret storage)
- Attach the group to the backend service (service settings)

### Variables you must set (baseline)

Use `14-env-reference.md` as the source of truth. Typical required set:

**DB**

- `DATABASE_HOST`
- `DATABASE_NAME`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- (optional) `DATABASE_PORT`

**Auth**

- `JWT_SECRET`
- `NODE_ENV='production'`

**CORS / Public URL**

- `CORS_ORIGINS` must include:
  - `https://www.cowboylogic.net`
  - `https://cowboylogic.net`
- `BASE_URL='https://api.cowboylogic.net'` (recommended for correct absolute URLs)

**Square**

- `SQUARE_ACCESS_TOKEN`
- `SQUARE_LOCATION_ID`
- `SQUARE_SUCCESS_URL`
- `SQUARE_WEBHOOK_SIGNATURE_KEY` (production must be set; fail-closed)
- `SQUARE_WEBHOOK_NOTIFICATION_URL` (only if your signature code requires canonical URL; if used, it must match the public webhook URL exactly)

**Google login**

- `GOOGLE_CLIENT_ID`

**Mail (Mailgun/SMTP)**

- `MAIL_PROVIDER`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USER`
- `MAIL_PASS`
- `MAIL_ADMIN` (or `EMAIL_ADMIN` fallback if your deployment uses it)

**Cloudinary**

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Notes:

- Do **not** set `PORT` manually unless your code requires it. Render injects `PORT`.
- Do **not** try to configure TLS cert files on Render. Render terminates TLS for you.
  - Seeing logs like “HTTPS disabled … fallback to HTTP” can be normal.

Related:

- `07-network-cors-https-uploads.md`
- `08-square-operations.md`
- `09-google-login-setup.md`
- `11-mailgun-setup.md`
- `12-mail-operations.md`
- `13-cloudinary-setup.md`

---

## Step 4 — Add Custom Domain in Render (api.cowboylogic.net)

1. Render → your backend service → **Settings** (or **Domains**).
2. Add custom domain: `api.cowboylogic.net`
3. Render will show the required DNS target (CNAME/ALIAS instructions).

Cloudflare note:

- You must create the DNS record in Cloudflare to point `api.cowboylogic.net` to Render.
- Keep Cloudflare **DNS-only** until everything is stable, then decide whether to enable proxy.

---

## Step 5 — Deploy (Auto vs Manual)

### Auto-deploy (GitHub)

If auto-deploy is enabled:

- Any push to `main` triggers a deploy (“New commit via Auto-Deploy”).

### Manual deploy

Render service → **Manual Deploy**:

- Use after env changes (or to redeploy a specific commit).

---

## Step 6 — Post-deploy Verification (deterministic)

Run these from your machine (PowerShell).

### 1) Backend reachable

'(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net").StatusCode'

Expected:

- `200`, `301`, `302`, or `404` are acceptable.
- Timeout is not acceptable.

### 2) Ping endpoint must return 204

'(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net/api/square/_ping").StatusCode'

Expected:

- `204`

### 3) Static check must show ok + uploadsDir

'Invoke-RestMethod -Method Get -Uri "https://api.cowboylogic.net/__static_check"'

Expected:

- JSON containing `ok: true` and `uploadsDir`.

If any check fails:

1. Open Render → service → **Logs**
2. Confirm env vars exist (do not paste them anywhere)
3. Redeploy after env changes

Related:

- `04-run-and-health-check.md`

---

## Operational Notes (Render Free tier)

- Free instances can “spin down” on inactivity → first request may be slow.
- Treat cold-start delay as expected unless requests time out consistently.

---

## Hard STOP Conditions

Stop and escalate if:

- You are not sure which DB host/name you are pointing at.
- You do not have a backup before DB recovery/migration actions.
- You see signature verification disabled/missing key in production logs.

Related:

- `06-database-operations.md`
- `00-secret-hygiene.md`
