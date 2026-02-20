# 18) Cloudflare Setup (DNS/TLS for `cowboylogic.net`)

This runbook explains how to configure Cloudflare so the CowboyLogic **frontend** (Vercel) and **backend** (Render) domains resolve correctly.

Operator audience: technical operator (not a developer).

---

## Safety Rules (P0)

- Do not paste secrets (tokens, API keys) into docs/chat/tickets/screenshots/commits.
- DNS changes affect production traffic. If unsure, stop and escalate.
- After DNS changes: wait for DNS propagation and verify with deterministic checks.

Related:

- `00-secret-hygiene.md`
- `12-network-cors-https-uploads.md`
- `14-env-reference.md`

---

## Goal (Target State)

These hostnames must work:

- Frontend:
  - `https://www.cowboylogic.net` (primary)
  - `https://cowboylogic.net` (apex) redirects to `www` (recommended)
- Backend API:
  - `https://api.cowboylogic.net` (Render Web Service custom domain)

---

## Prerequisites

You must have:

- Cloudflare account access for zone `cowboylogic.net`
- Ability to edit **DNS records** and **SSL/TLS** settings
- You already completed Render setup for backend (custom domain added in Render)
- You already completed Vercel setup for frontend (custom domain added in Vercel)

Operator note:

- Vercel and Render will each show you the exact DNS target they expect. Use those as source-of-truth.

---

## Step 1 — Open Cloudflare DNS Records

1. Cloudflare Dashboard → select zone: `cowboylogic.net`
2. Go to `DNS` → `Records`

You will edit/add records for:

- `www`
- `api`
- (optional) apex `@` / `cowboylogic.net`

---

## Step 2 — Backend DNS (Render): `api.cowboylogic.net`

### Expected record type

- `CNAME` record:
  - Name: `api`
  - Target: the Render-provided hostname (example format: `something.onrender.com`)
  - Proxy status: **DNS only** (recommended for initial stabilization)

### Procedure

1. Find existing record for `api`
2. Ensure it is:
   - Type: `CNAME`
   - Name: `api`
   - Content/Target: `<RENDER_TARGET_HOSTNAME>`
   - Proxy status: `DNS only` (grey cloud)
3. Save

Why DNS-only first:

- It reduces variables while debugging webhooks/CORS/TLS.
- After everything is stable, you can decide if you want Cloudflare proxy on `api`.

---

## Step 3 — Frontend DNS (Vercel): `www.cowboylogic.net`

### Expected record type

- `CNAME` record:
  - Name: `www`
  - Target: the Vercel-provided hostname (example format: `something.vercel-dns.com`)
  - Proxy status: **DNS only** (recommended)

### Procedure

1. Find existing record for `www`
2. Ensure it is:
   - Type: `CNAME`
   - Name: `www`
   - Content/Target: `<VERCEL_TARGET_HOSTNAME>`
   - Proxy status: `DNS only` (grey cloud)
3. Save

---

## Step 4 — Apex domain: `cowboylogic.net` (`@`)

You have two common valid patterns. Pick one and keep it consistent.

### Option A (recommended): redirect apex → www

Goal:

- `https://cowboylogic.net` redirects to `https://www.cowboylogic.net`

DNS:

- Keep apex record as-is (often `A` record to hosting provider), OR point apex to Vercel using Vercel’s recommended method.

Redirect:

- Cloudflare Dashboard → `Rules` → `Redirect Rules`
- Create a rule:
  - If incoming URL hostname equals `cowboylogic.net`
  - Then redirect to `https://www.cowboylogic.net/$1`
  - Status code: `301`

### Option B: serve frontend on apex too

Goal:

- both `cowboylogic.net` and `www.cowboylogic.net` serve the same frontend

DNS:

- Configure apex per Vercel instructions (this varies by setup):
  - Either `A` record(s) to Vercel IP(s), or
  - `CNAME` flattening to Vercel target (Cloudflare supports flattening)

If you are not sure which option your current production uses:

- stop and check current behavior in browser first.

---

## Step 5 — SSL/TLS (Cloudflare)

Go to: Cloudflare Dashboard → `SSL/TLS`

### Baseline safe settings

- SSL/TLS encryption mode: **Full**
  - Use **Full (strict)** only when you are sure the origin certs are valid and correctly configured.
- Always Use HTTPS: **On** (recommended)
- Automatic HTTPS Rewrites: optional (usually safe)

Important:

- Render and Vercel terminate TLS on their side. Cloudflare should not break that by using an incompatible mode.

---

## Step 6 — Verification (deterministic)

Use PowerShell commands in single quotes so Markdown stays intact.

### 1) Frontend reachable

- `'(Invoke-WebRequest -Method Get -Uri "https://www.cowboylogic.net").StatusCode'`

Expected:

- `200`, `301`, or `302` (any response is fine; timeout is not)

### 2) Apex behavior (if you expect redirect)

- `'(Invoke-WebRequest -Method Get -Uri "https://cowboylogic.net" -MaximumRedirection 0).StatusCode'`

Expected:

- `301` or `302`

### 3) Backend reachable

- `'(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net").StatusCode'`

Expected:

- `200`, `301`, `302`, or `404` (any response is fine; timeout is not)

### 4) Backend ping must return 204

- `'(Invoke-WebRequest -Method Get -Uri "https://api.cowboylogic.net/api/square/_ping").StatusCode'`

Expected:

- `204`

### 5) Static check must show ok + uploadsDir

- `'Invoke-RestMethod -Method Get -Uri "https://api.cowboylogic.net/__static_check"'`

Expected:

- JSON contains:
  - `ok: true`
  - `uploadsDir` present

---

## Proxy Mode Guidance (DNS-only vs Proxied)

### Use DNS-only (recommended) when:

- you are debugging CORS/webhooks/signature mismatches
- you want the simplest path from client → origin
- you suspect Cloudflare caching/rules are interfering

### Consider Proxied later only when:

- everything is stable for at least a few days
- you have a clear reason (WAF, rate limiting, caching)
- you understand how it affects:
  - real client IP visibility
  - webhook signature canonical URL assumptions
  - caching headers

If you enable proxy for `api`:

- re-verify Square webhooks end-to-end (because URL/cert path can change behavior)

---

## Common Failures (what to check)

### `api.cowboylogic.net` returns 522 / timeout

- DNS target wrong (not the Render hostname)
- Render service is down
- Cloudflare proxy is on and interfering (turn DNS-only and retry)

### `www.cowboylogic.net` shows wrong site

- `www` CNAME points to old host (HostGator/other)
- Vercel domain not verified/assigned to correct project

### SSL errors / redirect loops

- SSL/TLS mode mismatch (try `Full`)
- Both Cloudflare and origin enforce redirects in conflicting ways
- Multiple redirect rules (Cloudflare + Vercel + app) fighting each other

---

## Source-of-Truth Notes (don’t guess)

- Render shows the exact target hostname for `api` custom domain.
- Vercel shows the exact target hostname for `www` custom domain.
- Cloudflare only wires DNS + TLS policy; it is not the deploy platform.
