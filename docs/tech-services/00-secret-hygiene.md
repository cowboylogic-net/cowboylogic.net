# 00) Secret Hygiene (P0)

This page explains how to handle passwords, tokens, and keys safely for CowboyLogic.

---

## Mandatory rule (read first)

- Assume any secret that was ever visible in repository examples/snippets may be compromised.
- If `server/.env.example` or any documentation ever contained non-empty values for sensitive variables, treat those values as compromised and rotate them immediately.
- Never put real secrets into:
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

## What counts as a “secret”

Secrets include anything that grants access, can sign/verify requests, or can impersonate the system:

- passwords (admin, database, mail),
- API tokens (Square, Mailgun),
- signing/verification keys (Square webhook signature key),
- JWT signing keys,
- OAuth client secrets,
- private key files (certificates, PEM files),
- any database credentials.

If you are unsure: treat it as a secret.

---

## Where secrets must live (allowed storage)

Secrets must be stored only in approved secure storage:

- password manager / secret vault, and/or
- hosting provider “environment variables / secrets” store.

Rules:

- Keep `.env` files out of Git.
- Do not store secrets in the `docs/` folder.
- Do not store secrets in shared drives unless the drive is a dedicated secret store with access control.
- Only authorized admins/operators should have access.

---

## Immediate actions checklist (do this first)

1. Stop sharing any current credentials.
2. Rotate secrets in external systems (Square / Google / Mailgun / Cloudinary / Database).
3. Update runtime environment variables with the new values:
   - Backend (Render)
   - Frontend (Vercel) — only public IDs, never secrets
4. Restart/redeploy services to apply changes:
   - Redeploy backend on Render after backend env changes
   - Redeploy frontend on Vercel after frontend env changes
5. Verify the affected flows still work (see verification checks below).

---

## Production runtime locations (where the secrets actually go)

### Backend secrets (Render)

These must be stored in Render environment variables:

- Square tokens/keys
- Mailgun SMTP password and API key
- Cloudinary API secret
- Database password
- JWT secret
- Any admin bootstrap password (if used)

### Frontend configuration (Vercel)

Frontend must not contain secrets.
Allowed frontend values are public IDs only, such as:

- `VITE_GOOGLE_CLIENT_ID`

Never store in frontend:

- `SQUARE_ACCESS_TOKEN`
- `MAIL_PASS`
- `MAILGUN_API_KEY`
- `CLOUDINARY_API_SECRET`
- database credentials
- JWT secrets

---

## Rotation table (what to rotate, where, how to verify)

| Secret                         | Where to rotate                                               | How to verify after rotation (operator checks)                                                                                                        |
| ------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SQUARE_ACCESS_TOKEN`          | Square Developer Dashboard (application credentials)          | Start a checkout from the website. Expect redirect to Square checkout and no Square API auth errors in Render logs.                                   |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Square Dashboard → Webhook subscription secret                | Send a Square “test event”. Expect: Square delivery is `2xx` AND Render logs show webhook received with no signature error.                           |
| `JWT_SECRET`                   | Secret store → Render env var                                 | Log in on the website, refresh the page, and confirm protected actions still work. (After rotation, old sessions may become invalid.)                 |
| `ADMIN_PASSWORD`               | App-level reset or controlled recovery                        | Admin can log in and access admin-only pages. Do not assume any “seeder” overwrites an existing password.                                             |
| `MAIL_PASS`                    | Mailgun → Domain settings → SMTP credentials (reset password) | Submit Contact form. Expect email arrives to `MAIL_ADMIN` and no SMTP auth/timeouts in Render logs.                                                   |
| `MAILGUN_API_KEY`              | Mailgun → API Keys (create/rotate key)                        | If your system uses Mailgun API paths, trigger the feature that depends on it and verify success in logs. If unused, still rotate and store securely. |
| `GOOGLE_CLIENT_ID`             | Google Cloud Console → OAuth client ID                        | Google login works on production website. If it fails, most common cause is mismatch between client and server IDs.                                   |
| `GOOGLE_CLIENT_SECRET`         | Google Cloud Console → OAuth client secret                    | Store securely. If your current flow uses ID token verification only, do not block operations on this secret unless code requires it.                 |
| `CLOUDINARY_API_SECRET`        | Cloudinary → API Keys (rotate/regenerate)                     | Upload an image via admin UI. Expect Cloudinary URL saved and image displays after refresh.                                                           |
| `DATABASE_PASSWORD`            | Database provider panel                                       | Backend stays connected after Render redeploy; site can load data (books/users/orders) without DB errors in logs.                                     |

---

## Fail-closed rule for Square webhook signatures (P0)

Square webhooks must be verified.

If backend logs show:

- `No SQUARE_WEBHOOK_SIGNATURE_KEY set`

Treat as a production misconfiguration.

Fix immediately:

1. Set `SQUARE_WEBHOOK_SIGNATURE_KEY`
2. Set `SQUARE_WEBHOOK_NOTIFICATION_URL` to the exact webhook URL:
   - `https://api.cowboylogic.net/api/square/webhook`
3. Redeploy backend on Render
4. Send a Square test webhook and confirm success

Never disable signature checks in production.

---

## Operator safety rules (keep this simple)

- Never paste secrets into chat/tickets/docs/screenshots/commits.
- Keep a private rotation log (not in Git).
- Rotate secrets:
  - after any suspected exposure,
  - after staff/vendor turnover,
  - on a schedule (recommended every 3–6 months for high-impact tokens).

---

## Minimal rotation log template (copy/paste)

Create a private note (not in Git) and fill it like this:

- Date:
- Who rotated:
- What rotated (names only, no values):
- Where rotated (Square/Google/Mailgun/Cloudinary/DB):
- Backend redeployed on Render (yes/no):
- Frontend redeployed on Vercel (yes/no):
- Verification done (what tests passed):
- Notes/issues:
