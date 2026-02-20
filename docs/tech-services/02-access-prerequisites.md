# 02) Access Prerequisites

You cannot run the procedures in this Technical Ops Guide safely without the access listed below.

Security rule: never put real passwords/tokens into docs, tickets, chat, screenshots, or commits.
Use placeholders only.

---

## Important: Two different “Admin” concepts (do not mix)

### A) App Admin (CowboyLogic website)

This is an account inside the CowboyLogic application (role-based access).

- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (used for initial super-admin bootstrap and/or recovery)
- Used to log into the CowboyLogic website admin area.

### B) External Service Admin (Dashboards / Hosting)

These are separate accounts for third-party systems.

Examples:

- Render account (backend hosting)
- Vercel account (frontend hosting)
- Google Cloud Console account (Google login settings)
- Square Dashboard account (payments + webhooks)
- Cloudinary account (image storage + API keys)
- Mailgun account (SMTP + API keys, DNS records)
- Hosting/DB admin account (HostGator/cPanel/phpMyAdmin for MySQL)

These are not the same as the CowboyLogic app admin credentials.

---

## Required access inventory (what + why + what credentials you must have)

### 1) Backend hosting access (Render)

You need this to:

- view backend logs,
- set/update backend environment variables,
- redeploy/restart the backend after env changes,
- confirm the service is running.

Credentials you need:

- Render account with access to the CowboyLogic backend service.
- Permission level that allows:
  - viewing logs,
  - editing environment variables,
  - triggering redeploy.

Typical place:

- Render Dashboard → Backend service.

---

### 2) Frontend hosting access (Vercel)

You need this to:

- set/update frontend environment variables,
- redeploy the frontend after env changes,
- confirm which domain is deployed and active.

Credentials you need:

- Vercel account with access to the CowboyLogic frontend project.
- Permission to view deployments and edit environment variables.

Typical place:

- Vercel Dashboard → Project settings.

---

### 3) Repository access (docs maintenance)

You need this to:

- read the runbooks,
- update docs when the system changes,
- commit doc fixes.

Credentials you need:

- GitHub account with write access to the repository (2FA recommended).

Typical place:

- GitHub organization/repository for CowboyLogic.

---

### 4) Database admin access (MySQL)

You need this to:

- verify database is reachable (when diagnosing incidents),
- create backups (before any recovery),
- perform controlled recovery steps (only when explicitly required by a runbook).

Credentials you need:

- DB admin tool access (e.g., HostGator/cPanel/phpMyAdmin login), and
- MySQL credentials used by the app (stored in secret storage / Render env):
  - `DATABASE_HOST`
  - `DATABASE_PORT`
  - `DATABASE_NAME`
  - `DATABASE_USERNAME`
  - `DATABASE_PASSWORD`

Typical place:

- HostGator / cPanel / phpMyAdmin.

---

### 5) Square Dashboard access

You need this to:

- view webhook delivery logs,
- send test webhook events (if supported),
- view/rotate Square credentials when required,
- confirm webhook destination URL matches production.

Credentials you need:

- Square Dashboard account (email + password + MFA).
- Permission level that allows:
  - viewing webhook subscription details,
  - viewing delivery logs,
  - accessing application credentials.

Typical place:

- Square Developer Dashboard → Applications / Webhooks.

---

### 6) Google Cloud Console access

You need this to:

- confirm OAuth client settings (Web Client ID),
- update allowed origins,
- verify OAuth consent screen configuration (if required).

Credentials you need:

- Google account (email + password + MFA) with access to the correct Google Cloud project.

Typical place:

- Google Cloud Console → APIs & Services → Credentials.

---

### 7) Cloudinary access (media uploads)

You need this to:

- locate the Cloud Name, API Key, and API Secret,
- rotate/regenerate Cloudinary keys if required,
- confirm uploads are arriving in the Cloudinary media library.

Credentials you need:

- Cloudinary account access with permission to view API keys.

Typical place:

- Cloudinary Console → Dashboard / API Keys.

---

### 8) Mailgun access (email sending)

You need this to:

- retrieve/reset SMTP credentials,
- rotate Mailgun API keys (if used),
- check sending/domain status (DNS, SPF/DKIM) if delivery problems occur.

Credentials you need:

- Mailgun account access for the domain `mg.cowboylogic.net`.

Typical place:

- Mailgun Dashboard → Sending → Domains → `mg.cowboylogic.net`.

---

### 9) Secret storage access (production environment values)

You need this to:

- read/update production env values safely,
- rotate secrets without exposing them in chat/docs,
- avoid “shared password” behavior.

What you need access to:

- the approved place where production secrets are stored
  (password manager / secret vault / hosting env stores),
- permission to update runtime env values (or a release owner who can do it immediately).

Typical places:

- Render env vars (backend)
- Vercel env vars (frontend)
- team-approved password manager / vault

---

## Access request checklist (copy/paste)

Ask the service owner to provi
