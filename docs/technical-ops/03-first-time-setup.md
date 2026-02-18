# 03) First-Time Setup

## Goal

Set up a safe local or “server-like” runtime using the provided `.env.example` files, without leaking secrets.

---

## Before You Start (have this ready)

- You have access to the repository folder on your machine.
- You have the required access listed in `02-access-prerequisites.md` (especially secret storage).
- You know whether you are setting up:
  - **Local**: frontend + backend on the same machine, or
  - **Server-like**: frontend calling a backend on another host (requires `VITE_API_URL`).

Security rule:

- **Do not use real secret values from `.env.example`**. Use your team’s secret storage values.

---

## Step-by-Step Setup

### Step 1 — Create client `.env`

1. Go to the client folder.

- `cd client`

2. Copy the example file.

- If your system supports it: copy `client/.env.example` → `client/.env` (use File Explorer if easier).

3. Open `client/.env` in a text editor.

4. IMPORTANT: the example currently contains a duplicate `VITE_API_URL` key.

- Keep **only one** `VITE_API_URL=...` line.
- Delete the duplicate line.

5. Set `VITE_API_URL` correctly:

- If frontend and backend run on the same host and backend is reachable via same origin proxy, your team may leave it empty or set it to local URL (depends on `client/src/utils/apiBase.js`, function `getApiBase`).
- If frontend must call a separate backend host, set:
  - `VITE_API_URL=https://<BACKEND_HOST>` (no trailing slash)

Save the file.

---

### Step 2 — Create server `.env`

1. Go to the server folder.

- `cd server`

2. Copy the example file.

- Copy `server/.env.example` → `server/.env` (use File Explorer if easier).

3. Open `server/.env` in a text editor.

4. Replace any example credentials/tokens/passwords with real values from secret storage.

- Do not keep the example values.
- Do not paste real secrets into docs/chat/tickets.

Save the file.

---

### Step 3 — Sanity-check scripts exist (no guessing)

From `client/`:

- `npm -v`
- `npm run` (confirm you can see scripts like `dev`, `build`)

From `server/`:

- `npm -v`
- `npm run` (confirm you can see scripts like `dev`, `start`, and `db:ping`)

---

### Step 4 — Verify DB connectivity before first start (server)

From `server/`:

- `npm run db:ping`

Expected:

- Output indicates the DB connection succeeded (for example: “Connected OK …”).

If DB ping fails:

- stop and fix DB settings first (host/user/password/port, network allowlist, etc.).

---

## What to Check (quick checklist)

- Client scripts exist in `client/package.json` (you can see `npm run dev` and `npm run build`).
- Server scripts exist in `server/package.json` (`npm start` exists).
- DB ping works: `npm run db:ping` from `server/`.

---

## If It Fails (common operator issues)

### Backend fails on startup due to missing env

- Check required env variables enforced by `server/config/requireEnv.js` (function `requireEnv`).
- Confirm you did not leave blank required values in `server/.env`.

### Frontend cannot call backend

- Confirm you set `VITE_API_URL` correctly (and removed the duplicate key).
- Re-check backend is running and reachable.
- Confirm behavior in `client/src/utils/apiBase.js` (function `getApiBase`): it decides which base URL is used.

### You are unsure which values are “required”

- Use the table in `13-env-reference.md` (it marks required vs optional).
