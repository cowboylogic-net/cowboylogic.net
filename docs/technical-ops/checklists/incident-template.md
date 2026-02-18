# Incident Template (Operator-Friendly)

Use this template when a production-like flow breaks (payments, login, emails, uptime).
Do **not** paste secrets.

Status: ☐ Open ☐ Mitigating ☐ Resolved  
Severity: ☐ P0 (user payments/login broken) ☐ P1 (major feature broken) ☐ P2 (minor)

---

## 1) Incident Summary

- Date/time (local):
  - Format: `YYYY-MM-DD HH:MM` (example: `2026-02-17 14:35`)
- Reported by (name/contact):
- Environment: ☐ DEV ☐ UAT ☐ PROD
- Impact (1 sentence):
  - Example: “Users cannot complete checkout; Square webhooks failing.”

---

## 2) Symptoms (what exactly is happening)

- What users saw (plain language):
  - Example: “After payment, order stays pending / user sees error page.”
- Exact error messages / log markers (copy text, no secrets):
  - Example: `Invalid Square signature`
- First known occurrence:
  - When did it start? What was the first report time?

---

## 3) What changed last (most important)

Check any that apply:

- ☐ Environment variables changed
- ☐ Server restarted / deployed new build
- ☐ Square webhook URL changed (ngrok restarted / new domain)
- ☐ Google OAuth settings changed
- ☐ Database changes (migration / manual edit)
- ☐ Nothing changed (unknown)

Details (short):

- Who changed it / what exactly changed:

---

## 4) Immediate Actions Taken (stop the bleeding)

1.
2.
3.

Examples:

- “Stopped release promotion.”
- “Rolled back config to previous values in secret storage.”
- “Restarted backend once via PM2.”
- “Disabled only the new feature flag (if applicable).”

Do **not**:

- disable webhook signature verification in production
- edit DB without a backup and an explicit runbook step

---

## 5) Evidence Package (attach or paste safe outputs)

### A) Health checks (copy results)

- Ping:
  - Command used:
  - Result (expected `204`):
- Static check:
  - Command used:
  - Result (expected JSON with `ok=true`):

### B) URLs tested (copy exact URLs)

- Backend base URL:
- Webhook destination URL (Square Dashboard):
- `SQUARE_WEBHOOK_NOTIFICATION_URL` (value shape only, no secrets):
  - Example: `https://<PUBLIC_HOST>/api/square/webhook`

### C) Logs (most useful)

- If using PM2:
  - Output from: `pm2 logs cowboylogic-api --lines 120`
- If not using PM2:
  - Last 80–120 lines from the backend console

### D) Square evidence (no secrets)

- Square Dashboard area used:
  - ☐ Webhooks delivery logs ☐ Test delivery tool ☐ Payments list
- Delivery result status (success/fail):
- Any Square request/event ID shown in Dashboard (if available):

### E) Screenshots (optional but helpful)

- ☐ Error screen in browser
- ☐ Square webhook delivery result screen
- ☐ Backend console error section

---

## 6) Root Cause (current understanding)

- Primary cause (best current guess):
- Contributing factors (if any):
- Confidence level: ☐ low ☐ medium ☐ high

---

## 7) Recovery Steps (what fixed it, or planned fix)

1.
2.
3.

Include:

- exact order of steps
- what was restarted (and how)
- what config was changed (describe, do not paste secrets)

---

## 8) Verification (prove it is fixed)

- Health endpoint status:
  - Ping result:
  - Static check result:
- Business flow test status:
  - ☐ email/password login OK
  - ☐ Google login OK
  - ☐ checkout creates Square link OK
  - ☐ Square webhook test delivery OK (2xx)
  - ☐ order finalized/materialized OK
  - ☐ contact/newsletter mail OK

---

## 9) Follow-up Tasks (prevent recurrence)

- Permanent fix owner:
- Due date:
- Documentation updates required:
- Add/update monitoring/logging markers:
- Preventative action (example):
  - “Document strict procedure when ngrok URL changes.”
  - “Add smoke test step to confirm webhook URL alignment.”

---

## References (runbooks)

- Troubleshooting: `../15-troubleshooting.md`
- Release Smoke Test: `release-smoke-test.md`
- ngrok Ops: `../07-ngrok-operations.md`
- Square Ops: `../08-square-operations.md`
- Google Login Ops: `../09-google-login-operations.md`
