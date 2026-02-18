# CowboyLogic Technical Operations Guide

This guide is for a technical operator who keeps CowboyLogic running and safely updates integrations.
It is written to be usable by non-developers.

**Safety rule:** never paste real secrets (tokens/passwords) into docs, chat, tickets, screenshots, or commits.

---

## Quick Start (use this first)

### If something is broken right now (payments/login/email)

1. Open **[15 Troubleshooting](./15-troubleshooting.md)** and follow the relevant section in order.
2. Run the **3 fast checks**:
   - Backend ping: see **[04 Run and Health Check](./04-run-and-health-check.md)**.
   - Static check: see **[04 Run and Health Check](./04-run-and-health-check.md)**.
   - Backend logs: see **[05 Runtime and Restart](./05-runtime-and-restart.md)**.
3. Record the incident using **[Incident Template](./checklists/incident-template.md)**.

### If you are doing a planned change (deploy/config/integration)

1. Read **[00 Secret Hygiene](./00-secret-hygiene.md)** first.
2. Confirm you have access using **[02 Access Prerequisites](./02-access-prerequisites.md)**.
3. Make the change.
4. Run **[Release Smoke Test](./checklists/release-smoke-test.md)** before declaring success.

---

## Operator Notes (fill from your environment)

Use placeholders only. Do not store secrets here.

- Site URL: `<SITE_URL>`
- Backend host (server): `<BACKEND_HOST>`
- Frontend host (if separate): `<FRONTEND_HOST>`
- Square Dashboard: `https://squareup.com/dashboard/` (login required)
- Square Developer Dashboard: `https://developer.squareup.com/` (login required)
- ngrok Dashboard: `https://dashboard.ngrok.com/` (login required)
- Google Cloud Console: `https://console.cloud.google.com/` (login required)
- Support contact: `<SUPPORT_EMAIL>`

---

## Read This First (P0)

- [00 Secret Hygiene](./00-secret-hygiene.md)
- [02 Access Prerequisites](./02-access-prerequisites.md)

---

## Main Runbooks

- [01 System Map](./01-system-map.md)
- [03 First-Time Setup](./03-first-time-setup.md)
- [04 Run and Health Check](./04-run-and-health-check.md)
- [05 Runtime and Restart](./05-runtime-and-restart.md)
- [06 Database Operations](./06-database-operations.md)
- [07 ngrok Operations](./07-ngrok-operations.md)
- [08 Square Operations](./08-square-operations.md)
- [09 Google Login Operations](./09-google-login-operations.md)
- [10 Super Admin Access and Recovery](./10-super-admin-access-recovery.md)
- [11 Mail Operations](./11-mail-operations.md)
- [12 Network, CORS, HTTPS, Uploads](./12-network-cors-https-uploads.md)
- [13 Environment Variables Reference](./13-env-reference.md)
- [14 Known Limitations](./14-known-limitations.md)
- [15 Troubleshooting](./15-troubleshooting.md)

---

## Checklists

- [Release Smoke Test](./checklists/release-smoke-test.md)
- [Incident Template](./checklists/incident-template.md)

---

## Appendix

- [Recommended Minimal Stable Runtime](./appendix/minimal-stable-runtime.md)

---

## Source-of-Truth Policy

- Commands and paths are based on repository code and scripts.
- Code references in this guide cite `path + function/identifier name`.
- Line numbers are best-effort and may drift as code changes.
- If docs and code disagree: treat code as source of truth and update docs.
