# 06) Database Operations (MySQL + Sequelize)

This runbook explains how to do safe database checks and (only when required) run Sequelize migrations.

Current production setup:

- Backend runs on Render
- Database is MySQL (managed by your hosting provider)
- Backend connects to DB using env vars configured in Render

---

## Before you start (STOP conditions)

Do not proceed if any is true:

- You are not 100% sure which database (host + name) the backend will connect to.
- You do not have a recent backup (or you do not know how to create one).
- You do not have approval / maintenance window for production changes.

---

## Where DB credentials live (production)

Database connection values are stored in the backend environment (Render).

Common DB variables (placeholders only):

- `DATABASE_HOST=<DB_HOST>`
- `DATABASE_PORT=<DB_PORT>` (usually `3306`)
- `DATABASE_NAME=<DB_NAME>`
- `DATABASE_USERNAME=<DB_USER>`
- `DATABASE_PASSWORD=<DB_PASSWORD>`

Rule:

- Do not copy/paste real values into docs, tickets, chat, or screenshots.

---

## Safe connectivity check (no schema changes)

### Option A (recommended): confirm DB connection from Render logs

1. Open Render Dashboard.
2. Select the backend service (API).
3. Open **Logs**.
4. Look for the startup line that confirms DB connection (example wording depends on code), such as:
   - `MySQL connected via Sequelize`

Expected:

- You can find a clear “connected” message after a deploy/restart.
  If you see “access denied”, “timeout”, or “could not connect”, stop and fix credentials/network.

### Option B: run DB ping inside Render service (only if Shell/SSH access is available)

1. Open Render Dashboard → your backend service.
2. Open **Shell** (or SSH access if enabled).
3. Run:
   - `npm run db:ping`

Expected:

- Output includes something like `Connected OK via ...`

If you do not have Shell/SSH access:

- Do not improvise.
- Use Option A (logs) and/or ask the service owner to run the ping command in a controlled way.

---

## Verify you are targeting the correct DB (operator check)

Before running any migration, confirm internally (do not copy values anywhere):

- `DATABASE_HOST` matches the intended environment
- `DATABASE_NAME` matches the intended environment
- `DATABASE_USERNAME` matches the intended environment
- `DATABASE_PORT` is correct (usually `3306`)

If anything is uncertain: stop.

---

## Backup (MySQL) — practical method (phpMyAdmin)

This is the safest operator-friendly backup.

1. Sign in to your hosting control panel (cPanel or equivalent).
2. Open **phpMyAdmin**.
3. Select the correct database (left sidebar).
4. Click **Export**.
5. Choose:
   - Export method: **Quick**
   - Format: **SQL**
6. Click **Go** and save the `.sql` file in a safe location (not inside the git repo).
7. Write down (privately, not in Git):
   - date/time
   - which environment (prod/stage)
   - where the backup file is stored

Do not run production migrations without a backup.

---

## Migration workflow (production / high risk)

Only do this with:

- backup done,
- approval + maintenance window,
- ability to redeploy/restart the backend afterwards.

### Step 1 — Check migration status

In Render Shell/SSH:

- `npm run db:migrate:status`

Expected:

- a list of migrations with `up` / `down`

If you cannot run this command, stop and escalate.

### Step 2 — Apply pending migrations

In Render Shell/SSH:

- `npm run db:migrate`

Expected:

- pending migrations move from `down` → `up`

Do not run migrations repeatedly if you get an error.
Stop, copy the error text into a private operator note, and escalate.

### Step 3 — Re-check status

- `npm run db:migrate:status`

Expected:

- everything intended is now `up`

### Step 4 — Redeploy backend (if required)

If your backend does not automatically restart after running migrations:

- redeploy/restart the backend service in Render
- confirm it starts cleanly and connects to DB (see “Safe connectivity check”)

---

## Rollback (dangerous; only with backup + approval)

Rollback changes schema and can break data expectations.

- Undo last migration: `npm run db:migrate:undo`
- Undo all migrations: `npm run db:migrate:undo:all`

Never run `undo:all` on production unless you fully understand the impact.

---

## If it fails (common cases)

### Timeout / refused

Likely causes:

- DB host/port is wrong
- network/firewall blocks the connection
- hosting provider is down

Action:

- confirm host/port internally
- check hosting provider status
- check Render logs for the exact error

### Access denied

Likely causes:

- wrong DB username/password
- DB user permissions changed

Action:

- rotate/update DB password in hosting panel
- update Render env vars
- redeploy backend
- confirm DB connection in logs

### Wrong DB targeted

Likely cause:

- wrong env vars set in Render

Action:

- stop
- confirm DB host + name internally
- fix Render env vars
- redeploy and re-check logs

### Migration fails halfway

Action:

- stop immediately
- record:
  - which command you ran
  - the failing migration name
  - the exact error text
- escalate to the service owner
