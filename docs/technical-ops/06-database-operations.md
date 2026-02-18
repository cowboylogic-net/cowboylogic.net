# 06) Database Operations (MySQL + Sequelize)

This runbook is written for a technical operator (not a developer).
It focuses on **safe, repeatable** database checks and migrations.

---

## Before You Start (Read This First)

1. **Know where you are operating**

- Development / staging machine is usually safe for tests.
- Production database changes are **high risk**.

2. **STOP conditions (do not proceed)**

- You are not 100% sure which DB host/name you are pointing to.
- You do not have a backup (or do not know how to take one).
- You do not have approval / maintenance window for production changes.

3. **Minimum access needed**

- Ability to run commands in `server/`
- Database admin access (cPanel/phpMyAdmin or DB credentials)
- Access to runtime `.env` values stored on the host (without copying secrets into docs/chat)

---

## DB Connectivity Test (Safe)

Goal: confirm the backend can authenticate to the DB.

1. Open PowerShell / terminal in `server/`
2. Run: `npm run db:ping`
3. Expected:

- Output includes `Connected OK via`

### Verify you are targeting the correct DB (operator check)

Before running migrations, verify these values match the intended environment:

- `DATABASE_HOST`
- `DATABASE_NAME`
- `DATABASE_USERNAME`
- (optional) `DATABASE_PORT`

Do not paste real values into tickets/docs/chat. Only confirm internally that they match the expected DB.

---

## Migration Workflow (DEV / Staging)

**What migrations are:** step-by-step DB changes tracked by Sequelize CLI.
They should be applied in a controlled order.

1. Check current migration status first:

- Run: `npm run db:migrate:status`
- Expected: a list showing migrations as `up` or `down`

2. Apply pending migrations:

- Run: `npm run db:migrate`
- Expected: new migrations move from `down` → `up`

3. If something goes wrong

- Stop.
- Capture the terminal output.
- Do not re-run migrations repeatedly without understanding the error.

### Rollback (Use only when required)

Rollback is dangerous because it changes schema/data. Use only when you have a reason and a backup.

- Undo last migration: `npm run db:migrate:undo`
- Undo all migrations: `npm run db:migrate:undo:all`

**Operator warning:** `undo:all` can destroy schema state. Do not use it on production.

---

## Production-Style Ping (Safe)

Use this when you need to confirm production credentials/connectivity **without changing schema**.

1. Ensure `server/.env.production` exists and has the correct DB values (host/name/user/password).
2. Run: `npm run db:ping:prod`
3. Expected:

- Output includes `Connected OK via`

If `db:ping:prod` is not available on your host, do not improvise.
Escalate to the service owner and confirm which env file the production scripts use.

---

## Production Migrations (High Risk)

Only do this if:

- You have a backup,
- you have a maintenance window,
- you have approval,
- you can restart/verify the backend afterwards.

Recommended order:

1. Take a backup (see below)
2. Run status:

- `npm run db:migrate:status`

3. Run migrations:

- `npm run db:migrate`

4. Re-run status:

- `npm run db:migrate:status`

5. Restart backend safely (see `05-runtime-and-restart.md`)
6. Run health checks (see `04-run-and-health-check.md`)

---

## Backup (MySQL) — Minimal Practical Options

### Option A — Hosting panel / phpMyAdmin (most common)

1. Sign in to your DB panel (cPanel/phpMyAdmin or equivalent)
2. Select the correct database
3. Export:

- Format: SQL
- Mode: Quick (or Custom if you must)

4. Save the `.sql` file in a safe location
5. Record:

- date/time
- database name (internally)
- where the backup is stored

### Option B — mysqldump (only if you have CLI access)

This depends on your host configuration. Use placeholders and do not store secrets in command history.

Example pattern:

- `mysqldump -h <DB_HOST> -u <DB_USER> -p <DB_NAME> > backup-<DB_NAME>-<YYYYMMDD>.sql`

If you do not have `mysqldump` available, use Option A.

---

## Safety Rules (Non-Negotiable)

- Always take a backup before production migrations.
- Do not use uncontrolled schema sync in production (no ad-hoc sync/alter outside migrations).
- Before rollback, confirm impact and capture:
  - current migration status output
  - error output
  - what environment you are on
- Never paste DB passwords or connection strings into docs/chat.

---

## Verified Code Anchors (Source of Truth)

- `server/package.json`: scripts `db:*`
- `server/scripts/test-db.mjs`: DB authenticate flow used by ping scripts
- `server/config/config.cjs` and `server/.sequelizerc`: Sequelize CLI config wiring

---

## If It Fails (Common Cases)

### Timeout / refused

- Check network allowlist/firewall
- Verify `DATABASE_HOST` and `DATABASE_PORT`

### Access denied

- Verify `DATABASE_USERNAME` / `DATABASE_PASSWORD`
- Verify DB user grants/permissions

### Wrong DB targeted

- Verify active env file and loaded variables
- Confirm `DATABASE_HOST` + `DATABASE_NAME` match the intended environment

### Migration fails halfway

- Stop and capture the exact error output
- Do not keep retrying
- Escalate with:
  - the failing migration name
  - the command used
  - the exact error text
