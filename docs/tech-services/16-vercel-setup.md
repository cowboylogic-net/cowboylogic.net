# 16) Vercel Setup (Frontend)

This runbook explains how to deploy the CowboyLogic **frontend** on Vercel using **GitHub integration**.

It is written for an operator (non-developer). Follow the steps in order.

Security rule:

- Never paste real secrets into docs/chat/tickets/screenshots/commits.
- Use placeholders only (example: `<VITE_API_URL>`).

Repo:

- https://github.com/cowboylogic-net/cowboylogic.net

---

## Goal

- Vercel automatically builds and deploys the **client** app on every push to `main`.
- Production domain serves the website:
  - `https://www.cowboylogic.net` (primary)
  - `https://cowboylogic.net` (redirects to `www`)

Backend/API is deployed elsewhere (Render) and is reached via:

- `https://api.cowboylogic.net`

---

## Prerequisites (must have)

- Access to the GitHub repo (read + deploy permissions).
- Access to Vercel project for `cowboylogic.net`.
- API base URL decided and stable (example: `https://api.cowboylogic.net`).
- DNS is managed in Cloudflare (records will be required there).
  - Cloudflare steps are documented separately in `18-cloudflare-setup.md` (do not improvise DNS).

Reference:

- `02-access-prerequisites.md` (required access inventory)

---

## 1) Import the project from GitHub (one-time)

1. Open Vercel Dashboard.
2. Click **Add New… → Project**.
3. Connect GitHub (if not connected yet):
   - Authorize Vercel to access the repo **cowboylogic-net/cowboylogic.net**.
4. Select the repo and click **Import**.

---

## 2) Configure project settings (critical)

### A) Set the correct Root Directory

This is a monorepo. The frontend is inside `client/`.

In Vercel Project Settings:

- **Root Directory**: `client`

### B) Build settings (Vite)

Usually Vercel detects Vite automatically after Root Directory is correct.

Expected:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci` (preferred) or `npm install`

If Vercel shows different defaults, set the values above explicitly.

### C) Node.js version

Use the same Node version as the repo expects:

- If repo has `.nvmrc` or `package.json -> engines`, match it.
- If not defined, keep Vercel default (commonly Node 20).

Do not change Node version “randomly” in production.

---

## 3) Configure Environment Variables (Vercel)

Open:

- Project → **Settings → Environment Variables**

Set variables **for Production** at minimum.
If you use Preview deployments for PRs, also set the same variables for **Preview** (or expect previews to break).

### Required (typical)

- `VITE_API_URL=<PUBLIC_BACKEND_BASE_URL>`
  - Example: `https://api.cowboylogic.net`
  - Rules:
    - no trailing slash
    - must be the backend base (not the frontend domain)

### Google login (only if enabled)

- `VITE_GOOGLE_CLIENT_ID=<GOOGLE_OAUTH_CLIENT_ID>`

### Optional content variables (only if your UI uses them)

- `VITE_COMPANY_NAME=<TEXT>`
- `VITE_CONTACT_EMAIL=<EMAIL>`
- `VITE_COMPANY_ADDRESS=<TEXT>`
- `VITE_JURISDICTION=<TEXT>`
- `VITE_PRIVACY_LAST_UPDATED=<DATE_TEXT>`
- `VITE_TERMS_LAST_UPDATED=<DATE_TEXT>`

Important:

- In the repo, `client/.env.example` previously contained duplicate `VITE_API_URL`.
- In Vercel you will have only one value (good). Do not add duplicates.

---

## 4) Trigger the first deployment

1. Go to **Deployments** tab.
2. Ensure Production deploy uses branch:
   - `main`
3. Push a commit to `main` (or click **Redeploy** on the latest commit).

Expected:

- Deployment status becomes **Ready**.
- The “Visit” link opens the deployed site.

---

## 5) Configure Domains in Vercel (and DNS in Cloudflare)

### A) Add domains in Vercel

Go to:

- Project → **Settings → Domains**

Add:

- `www.cowboylogic.net` (primary)
- `cowboylogic.net` (redirect to `www`)

Expected:

- Vercel shows “Valid Configuration” once DNS is correct.

### B) DNS is managed by Cloudflare (do not guess records)

When you add domains, Vercel will show required DNS records (CNAME/A).

Do this:

- Open Cloudflare DNS for `cowboylogic.net`
- Create exactly the records Vercel requests

Important:

- If you use Cloudflare proxy (orange cloud), be consistent with the team’s SSL mode.
- Full Cloudflare procedure (DNS + SSL + redirects) is documented in:
  - `18-cloudflare-setup.md` (create this next; do not improvise here)

---

## 6) Verification (operator checks)

### A) Basic website check

Open:

- `https://www.cowboylogic.net`

Expected:

- Site loads (no blank page).

### B) API reachability from frontend

In browser DevTools:

- Network tab should show requests to `https://api.cowboylogic.net/api/...`

If the site loads but actions fail:

- go to `15-troubleshooting.md` section “Frontend cannot call API”
- confirm:
  - Vercel `VITE_API_URL`
  - backend is reachable
  - backend `CORS_ORIGINS` includes `https://www.cowboylogic.net` and `https://cowboylogic.net`

---

## 7) How deployments work (what to expect)

- Push to `main` → Vercel creates a **Production Deployment** automatically.
- Pull Request → Vercel creates a **Preview Deployment** (if previews are enabled).
- Environment Variables are scoped by:
  - Production / Preview / Development
  - Ensure the correct scope is set, or previews may break.

---

## 8) Rollback (safe operator action)

If a new frontend deployment breaks the site:

1. Vercel → Project → Deployments
2. Open the last known good deployment
3. Use **Redeploy** for that commit (or promote it if your UI offers that)

Do NOT:

- change random env vars “to see if it helps”
- change DNS without the Cloudflare runbook

---

## Common mistakes (fast list)

- Root Directory not set to `client/` → build fails or wrong artifact deployed.
- `VITE_API_URL` points to the frontend domain instead of backend → API calls fail.
- Missing `VITE_GOOGLE_CLIENT_ID` → Google button missing / login fails.
- Cloudflare DNS not updated to match Vercel domain records → domain not valid.
- Backend CORS does not include frontend origin → browser blocks requests.

---

## Related runbooks

- `13-env-reference.md`
- `12-network-cors-https-uploads.md`
- `15-troubleshooting.md`
- `18-cloudflare-setup.md` (planned; DNS/SSL/redirect rules)
- `17-render-setup.md` (planned; backend deployment)
