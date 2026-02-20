# Mailgun Setup (Email Sending)

This document explains how to configure Mailgun so the backend can send emails (contact form, password reset, notifications).

## Access to Mailgun

Sign in to Mailgun using the service credentials:

- `ADMIN_EMAIL=<ADMIN_EMAIL>`
- `ADMIN_PASSWORD=<ADMIN_PASSWORD>`

---

## What must work after setup

- The backend can send email through Mailgun SMTP.
- The “From” address uses your Mailgun domain: `postmaster@mg.cowboylogic.net`.
- DNS records for `mg.cowboylogic.net` are set so messages are trusted (SPF/DKIM/DMARC, tracking).

---

## Values you will set in the backend environment (placeholders only)

SMTP (sending email):

- `MAIL_PROVIDER=mailgun`
- `MAIL_HOST=smtp.mailgun.org`
- `MAIL_PORT=587`
- `MAIL_USER=postmaster@mg.cowboylogic.net`
- `MAIL_PASS=<SMTP_PASSWORD>`
- `MAIL_FROM_NAME=CLP Bookstore`
- `MAIL_FROM_EMAIL=postmaster@mg.cowboylogic.net`
- `MAIL_ADMIN=info@cowboylogic.net`
- `MAIL_REPLY_TO=info@cowboylogic.net`
- `MAIL_DEBUG=0`

Mailgun API (used by some features / future use):

- `MAILGUN_API_KEY=<MAILGUN_API_KEY>`
- `MAILGUN_DOMAIN=mg.cowboylogic.net`
- `MAILGUN_API_BASE=https://api.mailgun.net/v3`

Important:

- `MAIL_PASS` and `MAILGUN_API_KEY` are secrets. Store them only in the backend (Render). Never put them in the frontend (Vercel).

---

## Step 1 — Open the correct Mailgun domain

1. Log in to Mailgun.
2. In the left menu, go to **Sending → Domains**.
3. Select the domain: `mg.cowboylogic.net`.
4. Open **Domain settings**.

---

## Step 2 — DNS records (make Mail trusted)

In **Domain settings**, open the **DNS records** tab.
You will see a table with records to add at your DNS provider.

You must add the records exactly as Mailgun shows them:

- Copy the **Host (name)** value.
- Copy the **Value (points to)** value.
- Create the same record in your DNS provider.
- Save.
- Then return to Mailgun and click **Check status**.

### 2.1 Sending records (required)

These usually include:

**SPF (TXT)**

- Type: `TXT`
- Host: typically `mg.cowboylogic.net` (or similar)
- Value looks like: `v=spf1 include:mailgun.org ~all`

**DKIM (TXT)**

- Type: `TXT`
- Host looks like: `smtp._domainkey.mg.cowboylogic.net`
- Value is a long key that starts with something like `k=rsa; p=...`

If SPF/DKIM are not correct, messages may go to spam or be rejected.

### 2.2 Tracking record (recommended)

This enables open/click tracking and unsubscribe links.

- Type: `CNAME`
- Host looks like: `email.mg.cowboylogic.net`
- Value points to Mailgun (example: `mailgun.org`)

### 2.3 DMARC record (recommended)

This is an extra email safety record.

- Type: `TXT`
- Host looks like: `_dmarc.mg.cowboylogic.net`
- Value starts with: `v=DMARC1; ...`

### 2.4 Receiving records (MX) — only if you want inbound email

You may see MX records as **Unverified** in Mailgun.
MX records are needed only if you want Mailgun to RECEIVE email on that domain.

If you only send email (most common), MX can remain unverified and the system can still send.

If you do want inbound email / Mailgun Routes:

- Add both MX records exactly as Mailgun lists them (example: `mxa.mailgun.org`, `mxb.mailgun.org`).
- Then click **Check status** again.

---

## Step 3 — SMTP password (MAIL_PASS)

To send email through SMTP, you need a password for the SMTP user.

1. In Mailgun domain settings, open the **SMTP credentials** tab.
2. Find the SMTP login (example: `postmaster@mg.cowboylogic.net`).
3. Click **Reset Password**.
4. Mailgun will show a new password once — copy it immediately.
5. Save it as:
   - `MAIL_PASS=<SMTP_PASSWORD>`

---

## Step 4 — Mailgun API key (MAILGUN_API_KEY)

1. In Mailgun, open **API keys**.
2. Click **Create key**.
3. Give it a name (example: `Render`).
4. Mailgun will show the API key value once — copy it immediately.
5. Save it as:
   - `MAILGUN_API_KEY=<MAILGUN_API_KEY>`

Note:

- The “Key ID” is not enough by itself. You need the actual API key value that Mailgun shows after creation.

---

## Step 5 — Region check (API base)

Your config uses:

- `MAILGUN_API_BASE=https://api.mailgun.net/v3` (US region)

If your Mailgun account/domain is set to EU region, the API base is usually:

- `https://api.eu.mailgun.net/v3`

Do not change this unless you know the domain is EU.

---

## Step 6 — Add environment variables to the backend (Render)

1. Open Render dashboard.
2. Select the backend service.
3. Go to **Environment Variables**.
4. Add the variables (placeholders only here; real values in Render):

- `MAIL_PROVIDER=mailgun`
- `MAIL_HOST=smtp.mailgun.org`
- `MAIL_PORT=587`
- `MAIL_USER=postmaster@mg.cowboylogic.net`
- `MAIL_PASS=<SMTP_PASSWORD>`
- `MAIL_FROM_NAME=CLP Bookstore`
- `MAIL_FROM_EMAIL=postmaster@mg.cowboylogic.net`
- `MAIL_ADMIN=info@cowboylogic.net`
- `MAIL_REPLY_TO=info@cowboylogic.net`
- `MAIL_DEBUG=0`
- `MAILGUN_API_KEY=<MAILGUN_API_KEY>`
- `MAILGUN_DOMAIN=mg.cowboylogic.net`
- `MAILGUN_API_BASE=https://api.mailgun.net/v3`

5. Save changes.
6. Restart / redeploy the backend.

---

## Step 7 — Quick verification test

### Option A: use the website feature that sends email

Use a feature that triggers sending, for example:

- Contact form submission, or
- Password reset email (if enabled)

Expected:

- The email arrives to the destination inbox.
- In backend logs, the send operation completes successfully (no timeout).

### Option B: check backend logs on Render

Open Render logs right after triggering an email.
You should not see:

- `Connection timeout`
- SMTP authentication errors

---

## Troubleshooting

### Problem: “Connection timeout”

Possible causes:

- SMTP blocked by hosting network (rare but possible)
- Wrong host/port
- Region mismatch (for EU accounts)

Fix steps:

1. Confirm:
   - `MAIL_HOST=smtp.mailgun.org`
   - `MAIL_PORT=587`
2. If timeouts continue, try port 465 (SSL) by setting:
   - `MAIL_PORT=465`
3. If your Mailgun account is EU, try EU SMTP host:
   - `MAIL_HOST=smtp.eu.mailgun.org`

(After changes, redeploy backend.)

### Problem: “Authentication failed”

Cause:

- Wrong `MAIL_PASS` or wrong `MAIL_USER`

Fix:

- Reset SMTP password in Mailgun → SMTP credentials.
- Update `MAIL_PASS` in Render.
- Redeploy backend.

### Problem: Emails go to Spam

Cause:

- SPF/DKIM/DMARC not verified

Fix:

- Add missing DNS records exactly as shown in Mailgun.
- Click **Check status** until records show Verified/Active.

---

## Optional: Local developer session (PowerShell)

Set variables for the current PowerShell session (examples only):

`$env:MAIL_PROVIDER="mailgun"`
`$env:MAIL_HOST="smtp.mailgun.org"`
`$env:MAIL_PORT="587"`
`$env:MAIL_USER="postmaster@mg.cowboylogic.net"`
`$env:MAIL_PASS="<SMTP_PASSWORD>"`
`$env:MAIL_FROM_NAME="CLP Bookstore"`
`$env:MAIL_FROM_EMAIL="postmaster@mg.cowboylogic.net"`
`$env:MAIL_ADMIN="info@cowboylogic.net"`
`$env:MAIL_REPLY_TO="info@cowboylogic.net"`
`$env:MAIL_DEBUG="0"`
`$env:MAILGUN_API_KEY="<MAILGUN_API_KEY>"`
`$env:MAILGUN_DOMAIN="mg.cowboylogic.net"`
`$env:MAILGUN_API_BASE="https://api.mailgun.net/v3"`
