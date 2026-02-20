# Cloudinary Setup (Image Uploads)

This guide shows how to connect **Cloudinary** so the website can **upload and display images**.

## What Cloudinary does (plain words)

Cloudinary is an online storage service for images:

- You upload an image once.
- Cloudinary stores it.
- The website uses a link from Cloudinary to show the image.

## What you need

- A Cloudinary login (email + password).
- Access to the backend hosting dashboard (Render) to add “Environment Variables”.
- Admin login for the website (for testing uploads):
  - `ADMIN_EMAIL=<ADMIN_EMAIL>`
  - `ADMIN_PASSWORD=<ADMIN_PASSWORD>`

## The 4 environment variables you must set

Your backend must have these environment variables:

- `MEDIA_PROVIDER=cloudinary`
- `CLOUDINARY_CLOUD_NAME=<CLOUD_NAME>`
- `CLOUDINARY_API_KEY=<API_KEY>`
- `CLOUDINARY_API_SECRET=<API_SECRET>`

Important:

- `CLOUDINARY_API_SECRET` is like a password. Store it only on the backend (Render). Do not put it into the frontend (Vercel).

## Step 1 — Find Cloudinary “Cloud name”

1. Log into Cloudinary.
2. Open **Dashboard**.
3. Look for **Cloud name** (near the top).
4. Copy it — you will paste it later as:
   - `CLOUDINARY_CLOUD_NAME=<CLOUD_NAME>`

## Step 2 — Find API Key and API Secret

1. In Cloudinary, open **API Keys**.
   - On the dashboard you can click **Go to API Keys**.
2. You will see:
   - **API Key**
   - **API Secret** (hidden with dots/asterisks)
3. Copy them for later:
   - `CLOUDINARY_API_KEY=<API_KEY>`
   - `CLOUDINARY_API_SECRET=<API_SECRET>`

If there is no key yet:

- Click **Generate New API Key**.

## Step 3 — Add variables to the BACKEND (Render)

1. Open Render.
2. Select the **backend service** (API).
3. Go to **Environment** (Environment Variables).
4. Add the variables exactly (names must match):

- `MEDIA_PROVIDER=cloudinary`
- `CLOUDINARY_CLOUD_NAME=<CLOUD_NAME>`
- `CLOUDINARY_API_KEY=<API_KEY>`
- `CLOUDINARY_API_SECRET=<API_SECRET>`

Also ensure your admin login exists (for testing):

- `ADMIN_EMAIL=<ADMIN_EMAIL>`
- `ADMIN_PASSWORD=<ADMIN_PASSWORD>`

5. Click **Save**.

## Step 4 — Restart / redeploy the backend

After saving, the backend must restart to use the new settings.
In Render:

- Click **Manual Deploy** (or restart the service).

## Step 5 — Frontend (Vercel) note

The frontend usually does not need Cloudinary keys.
It only displays the image URL that the backend saved.

Do NOT put `CLOUDINARY_API_SECRET` into Vercel.

## Step 6 — Test uploads on the website

1. Open the website.
2. Log in with:
   - Email: `ADMIN_EMAIL`
   - Password: `ADMIN_PASSWORD`
3. Go to the admin page where you can create or edit a book.
4. Upload an image and save.
5. Confirm:
   - The image appears.
   - Refresh the page — it still appears.

How to confirm it is Cloudinary:

- Right-click the image → “Open image in new tab”.
- The link usually contains `res.cloudinary.com`.

## How the upload works (simple explanation)

1. You choose an image file on your computer.
2. The website sends it to the backend server.
3. The backend uploads it to Cloudinary using:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Cloudinary returns an image link (URL).
5. The backend saves that URL in the database.
6. The website shows the image using that URL.

## Troubleshooting

### Upload fails

Most common causes:

- One of the environment variables is missing or has a typo.
- The backend was not restarted after changes.

Fix:

- Re-check Render variables → Save → Manual Deploy.

### Image does not show after saving

Most common causes:

- Old cached page.
- The saved URL is not Cloudinary.

Fix:

- Refresh the page.
- Open image in a new tab and check the URL.

## Optional: Local developer test (PowerShell)

Set environment variables for the current PowerShell session (example format only):

`$env:MEDIA_PROVIDER="cloudinary"`
`$env:CLOUDINARY_CLOUD_NAME="<CLOUD_NAME>"`
`$env:CLOUDINARY_API_KEY="<API_KEY>"`
`$env:CLOUDINARY_API_SECRET="<API_SECRET>"`
