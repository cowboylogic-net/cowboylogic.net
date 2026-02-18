# 09) Google Login Operations (from zero)

This runbook is written for a technical operator. It explains how to set up and verify Google Sign-In
for this app’s **ID token** flow.

---

## What Is Verified in Code (Flow Type)

This app uses **ID token verification flow**:

- Frontend obtains a Google credential and sends `id_token` to backend.
- Backend verifies the ID token using `GOOGLE_CLIENT_ID` (audience check).
- There is **no** backend OAuth authorization-code exchange and **no** backend OAuth callback route in current runtime code.

---

## Official References (Operator)

- Google Cloud Console: `https://console.cloud.google.com/`
- APIs & Services (Credentials): `https://console.cloud.google.com/apis/credentials`
- OAuth consent screen: `https://console.cloud.google.com/apis/credentials/consent`

(Do not paste any real tokens/secrets into docs, tickets, or chat.)

---

## Required Variables (Baseline Operation)

You must set the **same Google Web Client ID** in both places:

- Client: `VITE_GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`
- Server: `GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`

### Variable Status Note (Important)

- `GOOGLE_CLIENT_SECRET` exists in `server/.env.example` but is **not used** by current runtime code for this flow.
- Treat it as **optional / verify-before-required**. Do not block go-live on it unless code changes later.

---

## Important: Admin Email/Password vs Google Login

Google login **does not grant admin access**.

- Admin access is controlled by the user role in the database (Admin/Super Admin).
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` are used for **seeding** a super admin (create-if-missing). They are not “Google settings”.
- A user who signs in with Google is still just a user account unless their role is granted by an Admin/Super Admin.

If you need an admin user:

- Use the normal email/password login for the seeded admin account (placeholders only in docs).
- Then grant roles via Admin Dashboard (preferred) or follow `10-super-admin-access-recovery.md` if recovery is required.

---

## Step 1 — Confirm You Have the Right Google Account and Project

1. In a browser, open: `https://console.cloud.google.com/`
2. Confirm you are signed in to the correct Google account that has access to the project.
3. Select the correct Google Cloud project (top bar project selector).

If you cannot access the project, stop and request access (see `02-access-prerequisites.md`).

---

## Step 2 — Configure OAuth Consent Screen (One-Time)

1. In Google Cloud Console, open “APIs & Services” → “OAuth consent screen”.
2. Choose the correct user type (usually “External” for public apps; org policy may differ).
3. Fill the minimum required fields:

- App name
- User support email
- Developer contact email

Save.

If your org requires publishing/verification steps, follow org guidance. For internal testing, draft mode may still work.

---

## Step 3 — Create an OAuth Client ID (Web Application)

1. In Google Cloud Console, open “APIs & Services” → “Credentials”.
2. Click “Create Credentials” → “OAuth client ID”.
3. Application type: **Web application**.
4. Name: something clear, e.g. `CowboyLogic Web Client`.

### Authorized JavaScript origins (critical)

Add the exact frontend origins that will host the UI:

- Production frontend origin: `https://<YOUR_PROD_DOMAIN>`
- Optional staging origin: `https://<YOUR_STAGING_DOMAIN>`
- Local development origin: `http://localhost:<VITE_PORT>`

Notes:

- Origins must match **scheme + host + port** exactly.
- Do not add trailing paths (origins are just the base origin).

### Authorized redirect URIs

For this app’s current **ID token** flow, redirect URIs are typically not required.
If your org policy requires a value, add the base site URL you actually use, but do not guess.
(Do not treat redirect URIs as the primary configuration for this flow.)

5. Create the client.
6. Copy the generated **Client ID** (this is the value you need). Do not copy secrets into docs.

---

## Step 4 — Apply the Client ID to App Environment

### Client (`client/.env`)

Set:

- `VITE_GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`

### Server (`server/.env`)

Set:

- `GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`

Security rules:

- Do not paste real values into documentation.
- Store values in your approved secret storage and inject into runtime env.

---

## Step 5 — Restart Services After Changes

1. Restart frontend (if you changed `client/.env`).
2. Restart backend (if you changed `server/.env`).

Use the restart approach documented in:

- `04-run-and-health-check.md` (how to run)
- `05-runtime-and-restart.md` (restart + single-instance checks)

---

## Step 6 — Operator Test (UI)

1. Open the website.
2. Go to Login or Register screen.
3. Click the Google login button.
4. Choose a Google account and proceed.

Expected:

- You become logged in to the app.
- Backend accepts `POST /api/auth/google` with an `id_token`.

---

## Step 7 — If It Fails (Common Cases)

### Google button is missing

Likely cause:

- `VITE_GOOGLE_CLIENT_ID` not set or frontend did not reload env

Fix:

- Confirm `client/.env` has `VITE_GOOGLE_CLIENT_ID`
- Restart `npm run dev` (or rebuild/redeploy frontend)

### “Invalid token” / “Invalid audience” / backend rejects login

Likely cause:

- `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` do not match, or wrong project client used

Fix:

- Ensure both env vars contain the same Web Client ID from Google Cloud Console
- Restart backend after change

### “Origin mismatch” / popup blocked / Google UI errors

Likely cause:

- Missing or incorrect Authorized JavaScript origin in Google Cloud Console

Fix:

- Add the exact frontend origin you are using:
  - `https://<YOUR_DOMAIN>` for production
  - `http://localhost:<PORT>` for local
- Save, then retry login

### Operator expects Google login to create an Admin

Reality:

- Google login only authenticates identity. Admin role is separate.

Fix:

- Use email/password seeded admin and grant roles via Admin Dashboard, or follow `10-super-admin-access-recovery.md`.

---

## Verified Code Anchors (Source of Truth)

- `client/src/main.jsx` (`GoogleOAuthProvider`, uses `VITE_GOOGLE_CLIENT_ID`)
- `client/src/components/LoginForm/LoginForm.jsx` (sends `id_token`)
- `client/src/components/RegisterForm/RegisterForm.jsx` (sends `id_token`)
- `server/routes/authRoutes.js` (`POST /google` mounted under `/api/auth`)
- `server/controllers/googleAuthController.js` (verifies ID token audience with `GOOGLE_CLIENT_ID`)
- `server/schemas/googleAuthSchema.js` (`id_token` schema)
