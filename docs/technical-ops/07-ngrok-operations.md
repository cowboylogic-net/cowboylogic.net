# 07) ngrok Operations (from zero)

This runbook is written for a technical operator who may have never used ngrok before.

## Official Resources (ngrok)

- Website: [https://ngrok.com](https://ngrok.com)
- Downloads: [https://ngrok.com/download](https://ngrok.com/download)
- Docs (CLI + guides): [https://ngrok.com/docs](https://ngrok.com/docs)
- Dashboard (Authtoken lives here after login): [https://dashboard.ngrok.com](https://dashboard.ngrok.com)
- Authtoken setup reference: [https://ngrok.com/docs/guides/getting-started/](https://ngrok.com/docs/guides/getting-started/)
- ngrok agent config reference (where `ngrok.yml` lives / how it’s structured): [https://ngrok.com/docs/agent/config/](https://ngrok.com/docs/agent/config/)
- Local inspector API reference (port `4040`): [https://ngrok.com/docs/agent/tunnel-inspection-api/](https://ngrok.com/docs/agent/tunnel-inspection-api/)

## What Is Verified in Code

- Webhook endpoint: `POST /api/square/webhook` (backend route in `server/app.js`).
- Test endpoint: `GET /api/square/_ping` returns `204 No Content` (backend route in `server/app.js`).
- Backend listener mode:
  - If SSL cert/key are available, backend can run HTTPS on `PORT_HTTPS`.
  - Otherwise it falls back to HTTP on `PORT` (see backend startup in `server/server.js`).

## Goal

Create a public HTTPS URL (ngrok tunnel) that forwards traffic to your local backend so Square webhooks can reach:

`https://<PUBLIC_NGROK_HOST>/api/square/webhook`

## Prerequisites

1. You can start the backend locally and you know which port it listens on (`PORT` or `PORT_HTTPS`).
2. You have an ngrok account (free plan is OK for development).
3. You have permission to change the webhook URL in Square Dashboard and to update backend environment variables.

---

## Step 1 — Install ngrok on Windows

1. Open **PowerShell**.

2. Check if ngrok is already installed:

`ngrok version`

- If you see a version → go to **Step 2 — Get Your ngrok Authtoken**.
- If the command is not found → install ngrok:

3. Download ngrok (Windows ZIP) from the official download page:

- [https://ngrok.com/download](https://ngrok.com/download)

4. Unzip it (you will get `ngrok.exe`).

5. Put `ngrok.exe` into a folder that is in your `PATH` (or add a folder to `PATH`).

**Common simple option (recommended):**

- Create: `C:\Tools\ngrok\`
- Put `ngrok.exe` there
- Add `C:\Tools\ngrok\` to `PATH` (Windows Environment Variables)
- Close PowerShell and open a new PowerShell window

6. Re-check:

`ngrok version`

---

## Step 2 — Get Your ngrok Authtoken

ngrok requires an account token to enable authenticated usage reliably.

1. Sign in to your ngrok account:

- [https://dashboard.ngrok.com](https://dashboard.ngrok.com)

2. Find your **Authtoken** in the ngrok Dashboard (commonly under “Your Authtoken” / “Auth” / “Getting Started”).

3. Copy the token.

**Security rule:** never paste the real token into docs, tickets, chat, screenshots, or commits.

---

## Step 3 — Add Authtoken on This Machine

In PowerShell:

`ngrok config add-authtoken <NGROK_AUTHTOKEN>`

Expected outcome:

- ngrok reports that the token was saved.

### Where ngrok stores config on Windows

Common default location:

- `C:\Users\<YOU>\AppData\Local\ngrok\ngrok.yml`

You do not need to edit this file manually. Record the actual path used on the runtime machine if your operator process requires it.

(Reference: [https://ngrok.com/docs/agent/config/](https://ngrok.com/docs/agent/config/))

---

## Step 4 — Start Backend (Local)

Start your backend first.

1. Open a PowerShell window.

2. Go to backend folder:

`cd C:\RogerProject\cowboylogic.net\server`

3. Start backend (choose the script your project uses):

`npm start`

or (development):

`npm run dev`

4. Look at the backend startup logs and decide the listener mode:

- If logs say **HTTPS backend running on port `<PORT_HTTPS>`** → use HTTPS mode.
- If logs say **HTTP backend running on port `<PORT>`** → use HTTP mode.

You need this info for the tunnel command.

---

## Step 5 — Start ngrok Tunnel

Open a **second** PowerShell window for ngrok.

### If backend is in HTTP mode

`ngrok http http://localhost:<PORT>`

Example (if `PORT=5000`):

`ngrok http http://localhost:5000`

### If backend is in HTTPS mode

`ngrok http https://localhost:<PORT_HTTPS>`

Example (if `PORT_HTTPS=8443`):

`ngrok http https://localhost:8443`

Expected outcome:

- ngrok shows a **Forwarding** URL, for example:
  - `https://abcd-123-45-67-89.ngrok-free.app`

That `https://...` value is your public tunnel URL.

---

## Step 6 — Copy the Public Tunnel URL

In the ngrok terminal UI, find the line:

- `Forwarding  https://<PUBLIC_HOST>  ->  ...`

Copy the **https** URL.

---

## Step 7 — Verify the Tunnel Reaches the Backend (Fail Fast)

Use the verified ping endpoint.

Run:

`curl -i <NGROK_URL>/api/square/_ping`

Expected:

- HTTP `204 No Content`

If you do not get `204`:

- you tunneled the wrong port, or
- you used HTTPS vs HTTP incorrectly, or
- backend is not running.

---

## Step 8 — Find Current Public URL Without Looking at the ngrok Console

ngrok exposes a local inspector API on port `4040`.

Run:

`curl -s http://127.0.0.1:4040/api/tunnels`

Expected:

- output contains a `public_url` field like `https://...`

(Reference: [https://ngrok.com/docs/agent/tunnel-inspection-api/](https://ngrok.com/docs/agent/tunnel-inspection-api/))

---

## Step 9 — Stop ngrok

If ngrok is running in the foreground:

- press `Ctrl + C`

If you must stop it from another PowerShell window:

`Get-Process ngrok | Stop-Process`

---

## Mandatory Procedure — ngrok URL Changed (Strict Order)

When ngrok restarts, the public URL usually changes (especially on the free plan).  
Square signature verification depends on the **exact** webhook URL.

Do this in order:

1. **Update Square Dashboard**

- Set the webhook destination URL to:
  - `<NEW_NGROK_URL>/api/square/webhook`

2. **Update backend environment**

- Set:
  - `SQUARE_WEBHOOK_NOTIFICATION_URL=<NEW_NGROK_URL>/api/square/webhook`

3. **Restart backend**

- Restart using your actual supervisor (PM2/systemd/etc.) or `npm start`.
- Confirm only one backend instance is running.

4. **Send a Square test webhook**

- From Square Dashboard, send a test event.
- Confirm:
  - Square shows successful delivery (2xx), and
  - backend logs show inbound webhook marker and **no signature error**.

---

## If It Fails (Common Cases)

### Ping fails (no 204)

- Wrong port.
- Wrong protocol (tunneling HTTPS while backend is HTTP, or vice versa).
- Backend not running.

### Square webhook delivery fails

- Verify URL path is exactly: `/api/square/webhook`
- Verify scheme/host/path match exactly between:
  - Square Dashboard webhook URL
  - `SQUARE_WEBHOOK_NOTIFICATION_URL`
- Check trailing slash consistency (avoid adding/removing `/` at the end).

### Signature mismatch / “Invalid Square signature”

- This is usually caused by URL mismatch (scheme/host/path/trailing slash).
- Fix the URL alignment first (follow the strict procedure above).
- Do not disable signature verification in production.
