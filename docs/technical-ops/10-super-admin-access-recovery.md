# 10) Super Admin Access and Recovery

This runbook explains how to regain access to a **Super Admin** account safely.

**Important:** Database recovery is a **last resort**. If you are not confident, stop and escalate to the service owner/developer.

---

## What Is Verified (How Provisioning Works)

- The super admin **seeder creates the account only if it does not exist** (idempotent create-if-absent).
- The seeder **does not overwrite** an existing user password by default.

Meaning:

- Re-running the seeder will usually **NOT** “reset” the admin password if the account already exists.

---

## Quick Decision Tree (what to do)

1. **Can you log in as Super Admin right now?**

- Yes → use **Normal Access** (recommended).
- No → go to (2).

2. **Is there another Admin/Super Admin who can log in?**

- Yes → ask them to reset your access using the normal UI/admin process.
- No → go to (3).

3. **No admin can log in**

- You may need **Controlled DB Recovery (Last Resort)**.
- Do not do this without a backup and approvals.

---

## Normal Access (recommended)

### A) Log in normally

1. Open the website: `<SITE_URL>`
2. Click `Login`
3. Log in using the admin account email: `<ADMIN_EMAIL>`

### B) Change password using the application flow (when already logged in)

If the application UI provides a password change screen:

1. Go to Profile / Account settings (or the admin area if that is where it lives).
2. Use the “Change password” form.
3. Confirm you can log out and log in again with the new password.

If the only option is an authenticated API endpoint:

- This is still **not** a “public reset” flow; it requires being logged in first.
- If you cannot log in, you cannot use this method.

---

## Controlled DB Recovery (Last Resort)

Use this only if:

- no admin can log in, and
- you have explicit approval to perform DB changes, and
- you have DB admin access.

### Safety prerequisites (do not skip)

1. **Backup first.**
2. Confirm you are connected to the **correct** database (production vs dev).
3. Confirm you can identify the Super Admin user by email.

### Recovery steps (high-level, safe)

1. Locate the Super Admin user row by:
   - email = `<ADMIN_EMAIL>`, and
   - super-admin flag/role = true (whatever your schema uses).
2. Export the target row before changes (so you can roll back).
3. Reset the password **only using the same hashing mechanism the app uses**.
   - Do **not** store a plain text password in the DB.
   - If you do not have a verified script/tool to generate the correct hash, **stop and escalate**.
4. Session invalidation:
   - If a `tokenVersion` (or equivalent) column exists and is used by auth, increment it.
   - If no such field exists, **rotate `JWT_SECRET`** (this invalidates all existing JWT sessions).
5. Verify exactly **one** row was modified.
6. Re-test:
   - Admin can log in.
   - Admin-only pages/endpoints work.

### What NOT to do

- Do not “reseed and hope it overwrites the password” (it does not).
- Do not disable authentication or bypass password hashing.
- Do not change multiple users “just in case”.

---

## Security Rules

- Never document real admin credentials.
- Use placeholders only: `<ADMIN_EMAIL>`, `<ADMIN_PASSWORD>`.
- Store credentials only in approved secret storage.
- After any recovery, rotate any credentials that may have been exposed.

---

## Verified Code Anchors

- `server/seeders/20250826090000-seed-super-admin.cjs` — idempotent create check.
- `server/seeds/seedSuperAdmin.js` — existing-user short-circuit.
- `server/controllers/resetPasswordController.js` — authenticated password reset flow.
- `server/models/User.js` — role/super-admin fields and user model behavior.
