# Google Login Setup (Google Cloud Console)

This document explains how to configure Google Sign-In for the CowboyLogic website.

## Access to the Google Cloud Console

To open the service console, sign in with:

- `ADMIN_EMAIL=<ADMIN_EMAIL>`
- `ADMIN_PASSWORD=<ADMIN_PASSWORD>`

Do not store these credentials in code. Keep them in a password manager.

---

## What you are setting up

You will create (or edit) a Google **OAuth 2.0 Client ID** of type **Web application**.

This produces two values:

- **Client ID** (public, used by frontend and backend)
- **Client Secret** (private, keep on backend only)

---

## Environment variables to set

These are the variables the app expects (placeholders only):

### Backend (Render)

- `GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`
- `GOOGLE_CLIENT_SECRET=<GOOGLE_CLIENT_SECRET>`

### Frontend (Vercel / Vite build)

- `VITE_GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`

Important:

- The **Client ID** must be the **same value** everywhere it is used.
- The **Client Secret** must be stored on the backend only.

---

## Step 1 — Open the correct Google Cloud project

1. Open Google Cloud Console.
2. Ensure you are signed in with the service account credentials above.
3. In the top bar, select the correct **Project** (project selector).

If you select the wrong project, you will generate a Client ID that will not work in production.

---

## Step 2 — Configure OAuth consent screen (one-time)

1. Go to **APIs & Services → OAuth consent screen**.
2. Fill the required fields:
   - App name
   - User support email
   - Developer contact email
3. Save.

If the app is in **Testing** mode:

- Add the emails that are allowed to test Google login under **Test users**.

---

## Step 3 — Create (or edit) OAuth Client ID (Web application)

1. Go to **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth client ID**.
3. Application type: **Web application**
4. Name: choose a clear name (example: `CowboyLogic Web Client`)

### 3.1 Authorized JavaScript origins (REQUIRED)

Add these **exact** origins (must match scheme + domain + port):

- `http://localhost:5173`
- `https://www.cowboylogic.net`
- `https://cowboylogic.net`

Rules:

- No paths here (no `/login`, no `/api`, etc.)
- `https://www...` and `https://...` are different — include both if you use both
- If you change the frontend domain later, you must update this list

### 3.2 Authorized redirect URIs (REQUIRED)

Add these redirect URLs:

- `http://localhost:5000/api/auth/google/callback`
- `https://api.cowboylogic.net/api/auth/google/callback`

Rules:

- Redirect URIs must be full URLs including the path
- They must match exactly (including https/http)
- If you change backend domain later, update this list

5. Save/Create.

---

## Step 4 — Copy Client ID and Client Secret

After you create the OAuth client, copy:

- **Client ID** → use as `<GOOGLE_WEB_CLIENT_ID>`
- **Client Secret** → use as `<GOOGLE_CLIENT_SECRET>`

Do not paste real values into documentation, tickets, or chat.

---

## Step 5 — Apply values to hosting (Production)

### 5.1 Backend (Render)

1. Open Render dashboard.
2. Select the backend service (API).
3. Go to Environment Variables.
4. Set:
   - `GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`
   - `GOOGLE_CLIENT_SECRET=<GOOGLE_CLIENT_SECRET>`
5. Save.
6. Redeploy / restart the service.

### 5.2 Frontend (Vercel)

1. Open Vercel dashboard.
2. Select the frontend project.
3. Go to Settings → Environment Variables.
4. Set:
   - `VITE_GOOGLE_CLIENT_ID=<GOOGLE_WEB_CLIENT_ID>`
5. Save.
6. Redeploy (a new build is required for env var changes).

---

## Step 6 — Apply values locally (Development)

If a developer runs the project locally, they must set the same values.

Example (PowerShell, current session only):

- `$env:GOOGLE_CLIENT_ID="<GOOGLE_WEB_CLIENT_ID>"`
- `$env:GOOGLE_CLIENT_SECRET="<GOOGLE_CLIENT_SECRET>"`
- `$env:VITE_GOOGLE_CLIENT_ID="<GOOGLE_WEB_CLIENT_ID>"`

---

## Step 7 — Verification test (Production)

1. Open the site:
   - `https://www.cowboylogic.net`
2. Go to Login/Register page.
3. Click the Google login button.
4. Choose a Google account and continue.

Expected result:

- Login succeeds and you are authenticated in the app.

---

## Common errors and fixes

### Error: `origin_mismatch`

Cause:

- The exact production origin is missing from **Authorized JavaScript origins**.

Fix:

- Ensure these are present exactly:
  - `https://www.cowboylogic.net`
  - `https://cowboylogic.net`
- Save changes, then retry.

### Google button missing

Cause:

- Frontend env var is missing or frontend was not redeployed.

Fix:

- Check Vercel env vars:
  - `VITE_GOOGLE_CLIENT_ID`
- Redeploy frontend.

### Backend rejects token / “invalid audience”

Cause:

- Client ID used by frontend does not match Client ID used by backend.

Fix:

- Ensure both use the same:
  - `VITE_GOOGLE_CLIENT_ID == GOOGLE_CLIENT_ID`
- Restart backend and redeploy frontend after changes.

### Test users / consent screen blocks login

Cause:

- Consent screen is in Testing mode and the account is not allowed.

Fix:

- Add the testing email(s) to **OAuth consent screen → Test users**.

---

## Change control / rotation

If you rotate the Client Secret:

- Update `GOOGLE_CLIENT_SECRET` on Render
- Restart/redeploy backend

If you create a new Client ID:

- Update **both**:
  - `VITE_GOOGLE_CLIENT_ID` (Vercel)
  - `GOOGLE_CLIENT_ID` (Render)
- Redeploy frontend and restart backend
- Re-check Authorized JavaScript origins and Redirect URIs
