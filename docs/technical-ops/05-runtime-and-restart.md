# 05) Runtime and Restart

This runbook explains how to restart the backend safely **even if you are not sure how it is supervised**.

---

## Verified Runtime Reality (from this repo)

- No production service definition is committed in this repo (no PM2 ecosystem file, no systemd unit, no Windows service wrapper).
- Existing docs mention PM2 usage, but the real production supervisor is not codified in repo config files.

**Meaning:** the operator must first identify how the backend is currently running on the host.

---

## Step 0 — Identify How the Backend Is Running (choose one path)

### Path A — PM2 (common for Node servers)

Run:

- `pm2 status`

If PM2 is installed and you see a process like `cowboylogic-api`, you are on **Path A**.

### Path B — Direct Node process started manually (npm start)

If PM2 is not used, you may be running the backend manually from `server/` with `npm start`.

To check if something is listening:

- `Get-NetTCPConnection -LocalPort <PORT> -State Listen`
- `Get-NetTCPConnection -LocalPort <PORT_HTTPS> -State Listen`

If a port is listening, record the local port and continue to restart steps.

### Path C — Host-managed service (Windows service / scheduled task / hosting panel)

This repo does not declare it, but the host may run Node as a service.
If you do not know, escalate to the service owner and ask:

- “Is this backend started by PM2, a Windows service, or manually?”

Do not guess in production.

---

## Safe Restart (Repo-backed baseline)

Use the restart method that matches your identified path.

Before restarting:

1. Confirm you are on the correct machine (production vs dev).
2. Confirm you have the current `.env` values ready (do not paste secrets into docs/chat).
3. Confirm which port the backend is currently using (HTTP `PORT` or HTTPS `PORT_HTTPS`).
4. Make sure you can run health checks after restart (see `04-run-and-health-check.md`).

---

## Restart Instructions

### Path A — Restart with PM2

1. Check current process list:

- `pm2 status`

2. Restart the backend:

- `pm2 restart cowboylogic-api --update-env`

3. Confirm it is running:

- `pm2 status`
- `pm2 logs cowboylogic-api --lines 100`

Expected:

- exactly one process named `cowboylogic-api`
- no crash loop

---

### Path B — Restart a non-managed `npm start` process

1. Stop the running server process (the terminal window running it):

- press `Ctrl + C`

2. Start again from `server/`:

- `cd <REPO_ROOT>\server`
- `npm start`

3. Watch logs:

- confirm DB connect success
- confirm listener mode (HTTPS or HTTP) and port

---

### Path C — Restart a host-managed service

This repo does not define the service name or tool.
Use your host’s documented procedure (service manager / hosting panel).

If you do not have a documented procedure, stop and request it from the service owner.
Do not “kill random node.exe processes” on a production host.

---

## How to Confirm “Single Instance” (must-do)

### If using PM2

Run:

- `pm2 status`

Expected:

- one backend process named `cowboylogic-api`

### If NOT using PM2 (PowerShell)

1. Check which process owns the listening port:

If HTTP mode:

- `Get-NetTCPConnection -LocalPort <PORT> -State Listen | Select-Object -First 5 -Property LocalAddress,LocalPort,OwningProcess`

If HTTPS mode:

- `Get-NetTCPConnection -LocalPort <PORT_HTTPS> -State Listen | Select-Object -First 5 -Property LocalAddress,LocalPort,OwningProcess`

2. Take the `OwningProcess` PID and confirm it is Node:

- `Get-Process -Id <PID> | Select-Object Id,ProcessName,Path`

Expected:

- `ProcessName` is `node` (or `node.exe`)
- there is a single PID owning the port

If you see multiple listeners (multiple rows), stop and investigate before proceeding.

---

## After Restart (always do this)

Re-run health checks from `04-run-and-health-check.md`:

- `GET /api/square/_ping` must return `204`
- `GET /__static_check` must return JSON with `ok: true`

If health checks fail, do not continue with webhook changes.

---

## Recommended Stable Runtime (if production supervisor is not defined)

- See Appendix: `appendix/minimal-stable-runtime.md`

This appendix is a recommendation, not a verified statement about your current production host.

---

## Verified Code Anchors (source of truth)

- `server/server.js`: function `start` (HTTPS first, HTTP fallback)
- `README.md`: deployment/runtime notes (textual)
- `server/docs/prod-db-runbook.md`: PM2 command examples (textual)

---

## Needs Verification (outside this repo)

- The exact production supervisor used on the real host (PM2/systemd/Windows service/etc.).
