# 10) Super Admin Access and Recovery

This runbook explains how to regain access to a Super Admin account safely.

Database recovery is a last resort. If you are not confident, stop and escalate.

---

## What is verified (how provisioning works)

- Super admin seeding is create-if-absent (idempotent).
- Re-running the seeder does NOT overwrite an existing password by default.

Meaning:

- If the admin user already exists, “running seed again” will not reset the password.

---

## Quick decision tree

1. Can you log in as Super Admin right now?

- Yes → use Normal Access (recommended).
- No → go to (2).

2. Is there another Admin/Super Admin who can log in?

- Yes → ask them to restore your access using the normal UI process.
- No → go to (3).

3. No admin can log in

- You may need Controlled DB Recovery (last resort).
- Do not do this without a backup and explicit approval.

---

## Normal access (recommended)

### A) Log in normally

1. Open the website:
   - `https://www.cowboylogic.net`
2. Click `Login`
3. Use the admin email:
   - `<ADMIN_EMAIL>`
4. Use the admin password from approved secret storage:
   - `<ADMIN_PASSWORD>`

Important:

- Google login does not automatically grant admin rights. Role is stored in the database.

### B) Change password using the application (if already logged in)

If the site provides a change-password screen:

1. Open Profile / Account settings
2. Use “Change password”
3. Log out and log in again to confirm the new password works

If only an authenticated API endpoint exists:

- it still requires being logged in first
- if you cannot log in, you cannot use this method

---

## Controlled DB recovery (last resort)

Use only if:

- no admin can log in,
- you have explicit approval for DB changes,
- you can create a backup,
- you have DB admin access (hosting panel / phpMyAdmin).

### Safety prerequisites (do not skip)

1. Backup first

- Use phpMyAdmin export (see `06-database-operations.md`).
- Store the `.sql` backup in a safe location (not in Git).

2. Confirm you are in the correct database

- Verify database name internally (do not paste it into docs/chat).
- Confirm you are not connected to a dev/stage database by mistake.

3. Confirm you can identify the admin user by email

- You must know the admin email from secret storage:
  - `<ADMIN_EMAIL>`

---

## DB recovery steps (safe order)

### Step 1 — Locate the user row (read-only)

In phpMyAdmin → SQL tab, run a read-only query (placeholders only):

`SELECT id, email, role, isAdmin, isSuperAdmin FROM users WHERE email = '<ADMIN_EMAIL>' LIMIT 1;`

Notes:

- Column names may differ (examples: `role`, `isAdmin`, `isSuperAdmin`).
- If columns differ, do not guess. Use phpMyAdmin “Structure” view for the `users` table to confirm actual column names.

### Step 2 — Confirm this is the correct account

Verify:

- email matches exactly
- the role/flags indicate admin access (for example: `role='admin'` or `isAdmin=1`)
- if your system has a super-admin field, confirm it (for example: `isSuperAdmin=1`)

If you cannot confidently confirm role/flags, stop and escalate.

### Step 3 — Export the row before changes (rollback safety)

Record the current values privately (not in Git), or export the row using phpMyAdmin export for that table/row.

Minimum:

- user id
- email
- role/flags
- password hash field value (do not share it)

### Step 4 — Password reset (only if you have a verified hash)

Important rule:

- You must NOT store a plain text password in the DB.
- You must set the password field to a hash produced by the same algorithm the app uses (commonly bcrypt).

If you do not have a verified method to generate the correct hash, stop and escalate.

If you do have a verified hash string (example placeholder):

- `<NEW_PASSWORD_HASH>`

Then update only that single user:

`UPDATE users SET password = '<NEW_PASSWORD_HASH>' WHERE email = '<ADMIN_EMAIL>' LIMIT 1;`

Notes:

- The password column may be named `password`, `passwordHash`, or similar.
- Use the table “Structure” view to confirm exact column name.

### Step 5 — Session invalidation (make old sessions useless)

Preferred (if supported by your schema):

- increment a token/session version column (example placeholder):
  - `tokenVersion = tokenVersion + 1`

Example pattern (only if the column exists):

`UPDATE users SET tokenVersion = tokenVersion + 1 WHERE email = '<ADMIN_EMAIL>' LIMIT 1;`

If there is no tokenVersion-style field:

- rotate `JWT_SECRET` in Render backend environment
- redeploy backend on Render

Warning:

- Rotating `JWT_SECRET` invalidates all sessions for all users.

### Step 6 — Verify exactly one row changed

In phpMyAdmin, check “affected rows” is exactly 1.

Then re-run the read-only query:

`SELECT id, email, role, isAdmin, isSuperAdmin FROM users WHERE email = '<ADMIN_EMAIL>' LIMIT 1;`

### Step 7 — Re-test in the app

1. Open the website
2. Log in with:
   - `<ADMIN_EMAIL>`
   - `<ADMIN_PASSWORD>`
3. Confirm admin-only pages work

---

## What NOT to do

- Do not “reseed and hope it overwrites the password” (it does not).
- Do not disable authentication or bypass hashing.
- Do not change multiple users “just in case”.
- Do not run random SQL updates if you are unsure of column names.

---

## Security rules

- Never document real admin credentials.
- Use placeholders only: `<ADMIN_EMAIL>`, `<ADMIN_PASSWORD>`.
- Store credentials only in approved secret storage.
- After any recovery, rotate any credentials that may have been exposed.

---

## Verified code anchors (for developers)

- `server/seeders/20250826090000-seed-super-admin.cjs` — idempotent create check
- `server/seeds/seedSuperAdmin.js` — existing-user short-circuit
- `server/controllers/resetPasswordController.js` — authenticated password reset flow (if present)
- `server/models/User.js` — role fields and password hashing behavior
