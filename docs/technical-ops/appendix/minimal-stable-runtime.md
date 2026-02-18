# Appendix: Recommended Minimal Stable Runtime (Windows + PM2)

This appendix exists because a production service definition (systemd/Windows service) is not committed in the repo.

It is written for an operator who needs a **repeatable** way to keep the backend running and restart it safely.

---

## Goal

Run the backend as a managed process that:

- restarts on demand,
- can persist across server reboots,
- has operator-visible logs,
- avoids “multiple instances” mistakes.

---

## Before You Start (one-time prerequisites)

### A) Confirm Node.js and npm exist on the server host

1. Open **PowerShell**.
2. Run:

- `node -v`
- `npm -v`

Expected: both commands print a version number.

If missing: install Node.js LTS on the server host (do not proceed until installed).

### B) Install PM2 (one-time)

In PowerShell:

- `npm i -g pm2`

Verify:

- `pm2 -v`

Expected: prints a version number.

---

## Repo Path Assumption

You must know the backend folder path on the host.

Example used below:

- `<REPO_PATH>` = `C:\RogerProject\cowboylogic.net`
- backend folder = `C:\RogerProject\cowboylogic.net\server`

Adjust paths for your real host.

---

## PM2 Baseline (recommended)

### 1) Initial setup (one-time per server host)

1. Open **PowerShell**.
2. Go to backend folder:

- `cd <REPO_PATH>\server`

3. Install backend dependencies (only needed after fresh clone or if node_modules is missing):

- `npm install`

4. Start backend under PM2:

- `pm2 start server.js --name cowboylogic-api --time`

Expected:

- PM2 prints that the process was started.
- `pm2 status` shows `cowboylogic-api` with status `online`.

5. Save the current PM2 process list (so PM2 can restore it after reboot):

- `pm2 save`

Expected:

- PM2 confirms the process list was saved.

6. Enable startup on reboot (one-time)

- Run:

- `pm2 startup`

Expected:

- PM2 prints a command you must run to register startup with Windows.
- Copy the generated command exactly and run it.

Important:

- This step may require elevated privileges (Run PowerShell as Administrator).

7. Confirm PM2 has saved processes:

- `pm2 resurrect`

Expected:

- `cowboylogic-api` returns to `online` (or stays online).

---

## Safe restart procedure (use after env/config changes)

Use this after you update runtime environment values (never store real secrets in docs).

1. Restart once and reload env:

- `pm2 restart cowboylogic-api --update-env`

2. Confirm there is exactly one backend instance:

- `pm2 status`

Expected:

- exactly one row named `cowboylogic-api`
- status `online`

3. Check last logs (fast signal):

- `pm2 logs cowboylogic-api --lines 100`

Expected:

- no crash loop
- startup logs indicate HTTP/HTTPS mode and successful boot

4. Run health checks (PowerShell)

If backend is HTTP mode:

- `(Invoke-WebRequest -Method Get -Uri "http://localhost:<PORT>/api/square/_ping").StatusCode`

Expected:

- `204`

Static check:

- `$r = Invoke-RestMethod -Method Get -Uri "http://localhost:<PORT>/__static_check"; $r.ok; $r.uploadsDir`

Expected:

- `$r.ok` is `True`
- `$r.uploadsDir` is a valid path

If backend is HTTPS mode, run the same checks against:

- `https://localhost:<PORT_HTTPS>/...`

Note:

- On some hosts you may need local TLS trust handling for HTTPS checks.

---

## Rollback pattern (keep it simple)

Use rollback only if a deployment/change broke production behavior.

1. Revert the changed artifact(s) only:

- code change (git revert / checkout previous tag), or
- environment values (restore previous known-good env values from secret storage)

2. Restart once:

- `pm2 restart cowboylogic-api --update-env`

3. Run the release smoke test:

- `checklists/release-smoke-test.md`

Do not:

- delete the PM2 process unless you are intentionally removing the service.
- run multiple launchers (PM2 + manual `npm start` at the same time).

---

## Notes / Operator warnings

- Keep **one** process manager for the backend. Do not mix PM2 with other service wrappers.
- If the host uses a different supervisor (systemd, Windows service wrapper), document that **outside** the repo or replace this appendix for your environment.
- If you see multiple instances, stop and fix it immediately (it can cause port conflicts and duplicated webhook processing).
