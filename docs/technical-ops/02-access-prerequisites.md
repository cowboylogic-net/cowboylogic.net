# 02) Access Prerequisites

You cannot run the procedures in this Technical Ops Guide safely without the access listed below.

This page is written for an operator. If you do not have an item, stop and request it.

**Security rule:** never put real passwords/tokens into docs, tickets, chat, screenshots, or commits.
Use placeholders only.

---

## Important: Two Different “Admin” Concepts (do not mix)

### A) App Admin (CowboyLogic website)

This is an account inside the CowboyLogic application (role-based access).

- **ADMIN_EMAIL / ADMIN_PASSWORD** (used for super-admin seeding or recovery)
- Used to log into the CowboyLogic website admin area.

### B) External Service Admin (Dashboards / Hosting)

These are separate accounts for third-party systems.

- Google Cloud Console account (email + password + MFA)
- Square Dashboard account (email + password + MFA)
- ngrok account (email + password + MFA) + authtoken
- Hosting/Server account (SSH key or Windows login)
- DB admin tool account (MySQL user + password)
- SMTP account (MAIL_USER / MAIL_PASS)

**These are not the same as the CowboyLogic app admin credentials.**

---

## Required Access Inventory (what + why + what credentials you must have)

### 1) Server access (SSH / RDP / console)

You need this to:

- start/restart the backend,
- view backend logs,
- confirm the backend is listening on the expected port (HTTP/HTTPS),
- verify uploads directory permissions.

Credentials you need (examples):

- Linux: `SSH_HOST`, `SSH_USER`, and an SSH key (preferred) or password (avoid).
- Windows host: `WINDOWS_HOST`, `WINDOWS_USER`, `WINDOWS_PASSWORD` (MFA if applicable).

Typical places:

- SSH to Linux server, or RDP/console for Windows host, or hosting provider console.

---

### 2) Repository access (read + write for docs)

You need this to:

- read the runbooks,
- update docs when the system changes,
- commit doc fixes.

Credentials you need:

- GitHub/GitLab account with repo access (prefer 2FA).

Typical places:

- GitHub/GitLab repository for CowboyLogic.

---

### 3) Database admin access (MySQL)

You need this to:

- confirm the database is reachable,
- run backups (before any recovery),
- perform controlled recovery steps (only when explicitly required by a runbook).

Credentials you need:

- DB admin tool access (e.g., cPanel/phpMyAdmin login), **and**
- MySQL credentials used by the app:
  - `DATABASE_HOST`
  - `DATABASE_PORT`
  - `DATABASE_NAME`
  - `DATABASE_USERNAME`
  - `DATABASE_PASSWORD`

Typical places:

- HostGator / cPanel / phpMyAdmin, or other MySQL admin tool used by your team.

---

### 4) Square Dashboard access

You need this to:

- update webhook destination URL,
- view webhook delivery logs,
- send test webhook events,
- manage/rotate Square credentials when required.

Credentials you need:

- Square Dashboard account (email + password + MFA)
- Permission level that allows:
  - Webhook subscription updates
  - Viewing webhook delivery logs
  - Sending test events (if supported)

Typical places:

- Square Dashboard / Developer Dashboard → Webhooks / Applications.

---

### 5) Google Cloud Console access

You need this to:

- confirm OAuth client settings (Client ID),
- update allowed origins if required by deployment changes,
- rotate credentials if team policy requires it.

Credentials you need:

- Google account (email + password + MFA) with access to the correct Cloud project.

Typical places:

- Google Cloud Console → APIs & Services → Credentials.

---

### 6) ngrok account + ngrok tool access

You need this to:

- authenticate ngrok on the machine (authtoken),
- start a tunnel and copy the public URL,
- re-check the current tunnel URL when it changes.

Credentials you need:

- ngrok account (email + password + MFA)
- ngrok **authtoken** (stored locally via `ngrok config add-authtoken ...`)
  - Never paste the real authtoken into docs.

Typical places:

- ngrok Dashboard + ngrok CLI on the operator machine.

---

### 7) SMTP / mail provider credentials access

You need this to:

- ensure email sending can authenticate,
- rotate the mail password if needed,
- verify contact/newsletter email delivery.

Credentials you need (runtime env variables):

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USER`
- `MAIL_PASS`
- Optional sender identity:
  - `MAIL_FROM_NAME`
  - `MAIL_FROM_EMAIL`
- Recipient routing (app-specific):
  - `MAIL_ADMIN` (and/or `EMAIL_ADMIN` if your deployment uses it)

Typical places:

- Mail provider admin portal (SMTP credentials) or team secret storage.

---

### 8) Secret storage access (production environment values)

You need this to:

- read/update production env values safely,
- rotate secrets without exposing them in chat/docs,
- avoid “shared password” behavior.

What you need access to:

- The approved place where production secrets are stored (secret manager / hosting env store).
- Permission to update runtime env values (or a release engineer who can do it immediately).

Typical places:

- A team-approved secret manager or restricted environment config storage.

---

## Access Request Checklist (copy/paste to request access)

Ask the service owner to provide access **without sending secrets in chat**:

- Server: `<SSH_HOST>`, `<SSH_USER>`, and approved auth method (SSH key / RDP user)
- Repo: add my account to repo with docs write access
- DB admin tool: cPanel/phpMyAdmin access (or DBA contact who can run actions quickly)
- MySQL app creds: `<DATABASE_HOST>`, `<DATABASE_NAME>`, `<DATABASE_USERNAME>` (password via secret storage)
- Square: add my user to Square Dashboard with webhook + logs permissions
- Google Cloud: add my Google account to the correct project (Credentials access)
- ngrok: confirm ngrok account access + allow me to configure local authtoken
- SMTP: confirm `MAIL_*` values exist in secret storage and who can rotate them

---

## Quick Self-Check (before you start any runbook)

Confirm you can do all of these:

1. You can log into the server host and view backend logs.
2. You can open the DB admin tool (or have a DBA who can do it immediately).
3. You can open Square Dashboard and view Webhooks + Delivery logs.
4. You can open Google Cloud Console and view OAuth Credentials.
5. You can log into ngrok Dashboard and you can run `ngrok version` on the operator machine.
6. You can access SMTP credentials from secret storage (without copying them into docs/chat).

If any check fails: stop and escalate.

---

## If Access Is Missing

- Do not improvise with shared passwords or screenshots of secrets.
- Do not ask anyone to send secrets via chat/email.
- Escalate to the service owner and request least-privilege access for your task.
- Record the blocked task and pending access in the incident log.

---

## Verified hints from this repository

- HostGator/cPanel DB workflow is referenced in `server/docs/prod-db-runbook.md`.
- Square and Google integrations are present in the backend codebase (Square checkout + webhook handling; Google login verification).
  - This means missing Square/Google access can block checkout and login operations.
