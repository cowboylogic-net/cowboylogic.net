# 00) Secret Hygiene (P0)

This page explains how to handle **passwords, tokens, and keys** safely for CowboyLogic.

It is written for an operator (non-developer). Follow it exactly.

---

## Mandatory Rule (Read First)

- **Assume any secret visible in repo examples/snippets may be compromised.**
- Verified risk in current repository state: `server/.env.example` contains **non-empty** values for sensitive variables such as:
  - `ADMIN_PASSWORD`
  - `SQUARE_ACCESS_TOKEN`
  - `SQUARE_WEBHOOK_SIGNATURE_KEY`
- **Treat those as compromised and rotate immediately.**
- **Never** put real secrets into:
  - documentation,
  - tickets,
  - chat,
  - screenshots,
  - commit messages,
  - email threads.

Use placeholders only, for example:

- `<JWT_SECRET>`
- `<SQUARE_ACCESS_TOKEN>`
- `<ADMIN_PASSWORD>`

---

## What Counts as a “Secret”

Secrets include anything that grants access or can sign/verify requests, such as:

- passwords (admin, database, mail),
- API tokens (Square),
- signing/verification keys (Square webhook signature key),
- JWT signing keys,
- OAuth client secrets (if used),
- any “private key” files.

If you are unsure: treat it as a secret.

---

## Immediate Actions Checklist (Do This First)

1. **Stop sharing** any current credentials (do not send them to anyone).
2. **Rotate** secrets in the external systems listed below (Square/Google/SMTP/DB).
3. **Update runtime environment variables** on the server with the _new_ values.
4. **Restart backend safely** (see `05-runtime-and-restart.md`).
5. **Verify** the affected flows still work (use the “How to verify” column below).

---

## Where Secrets Must Live (Allowed Storage)

- Use your organization’s approved secure storage:
  - password manager, secret vault, or secure hosting control panel secrets store.
- Keep `.env` files **out of Git** and **out of shared drives** whenever possible.
- Only the operator and authorized admins should have access.

**Never store secrets inside the docs folder.**

---

## Rotation Table (What to Rotate, Where, How to Verify)

| Secret                         | Where to rotate                                                                 | How to verify after rotation (simple operator checks)                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SQUARE_ACCESS_TOKEN`          | Square Developer Dashboard (application credentials)                            | Checkout creation works (trigger a real checkout from the site; backend route is `POST /api/square/create-payment`).                                                        |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Square Dashboard webhook subscription secret                                    | Send a Square “test event” and confirm: (1) Square delivery shows success (2xx) and (2) backend logs show inbound webhook and **no** “Invalid Square signature”.            |
| `ADMIN_PASSWORD`               | App-level reset (preferred) OR controlled DB recovery (only if locked out)      | Super admin can log in and access admin-only pages. Do **not** assume the seeder overwrites existing passwords.                                                             |
| `JWT_SECRET`                   | Secret store / server environment manager                                       | Login + refresh session still work; protected endpoints succeed. If login breaks after rotation, you likely updated only one environment or restarted incorrectly.          |
| `MAIL_PASS`                    | SMTP/mail provider account portal                                               | Submit the Contact form and confirm an email arrives (see `11-mail-operations.md` for the exact test).                                                                      |
| `GOOGLE_CLIENT_ID`             | Google Cloud Console (OAuth client for Web)                                     | “Login with Google” works. If it fails with audience/client mismatch, client/server IDs do not match.                                                                       |
| `GOOGLE_CLIENT_SECRET`         | Google Cloud Console (only if your deployment uses it)                          | Current CowboyLogic runtime uses **ID token** verification; client secret is not referenced in code right now. Still rotate/store securely, but do not block startup on it. |
| `DATABASE_PASSWORD`            | Database provider panel (HostGator/cPanel/phpMyAdmin or equivalent admin panel) | Run `npm run db:ping` in `server/` and confirm it succeeds (see `06-database-operations.md`).                                                                               |

---

## “Fail Closed” Rule for Square Webhook Signatures (Important)

Square webhooks must be verified.

- If backend logs ever show **`No SQUARE_WEBHOOK_SIGNATURE_KEY set`**, treat it as a **production misconfiguration**.
- Fix it immediately:
  1. set `SQUARE_WEBHOOK_SIGNATURE_KEY`,
  2. set `SQUARE_WEBHOOK_NOTIFICATION_URL` correctly,
  3. restart backend,
  4. send a Square test webhook and confirm success.

Never disable signature checks in production.

---

## Operator Safety Rules (Keep This Simple)

- Never paste secrets into chat/tickets/docs/screenshots/commits.
- Keep a **rotation log** (who rotated, what was rotated, date/time).
- Rotate secrets:
  - after any suspected exposure,
  - after staff/vendor turnover,
  - on a schedule (recommended: every 3–6 months for high-impact tokens).

---

## Minimal Rotation Log Template (Copy/Paste)

Create a private note (not in Git) and fill it like this:

- Date:
- Who rotated:
- What rotated (names only, no values):
- Where rotated (Square/Google/SMTP/DB):
- Backend restarted (yes/no):
- Verification done (what tests passed):
- Notes/issues:
