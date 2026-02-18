# 01 Overview

CowboyLogic has:

- public pages (you can open them without an account),
- signed-in pages (you must log in),
- role-based pages (only for Partner/Admin/Super Admin).

This guide uses simple steps and exact UI labels.

## What you can do without an account (public)

You can open these pages without logging in:

- `Home`
- `CLStrategies`
- `CLPublishing`
- `CLP Book Store` / `Book Store` / `Bookstore` (label depends on where you click it)
- `Cart`
- `Login`
- `Register`
- `Privacy`
- `Terms`
- `Contact Us`
- `About`

Where to find them:

- **Top navigation**: `Home`, `CLStrategies`, `CLPublishing`, store links, and (if enabled for your role) `Partner Store` / `Admin Dashboard`.
- **Footer (desktop)**: `About`, `Contact Us`, `Privacy`, `Terms`.
- **Mobile hamburger menu**: includes key navigation links (and `About`).
- **Footer (mobile)**: also includes `About`, `Contact Us`, `Privacy`, `Terms`.

## What becomes available after you log in

After login, you can open:

- `My Profile`
- `My Orders`
- `Favorites`

Important:

- `Favorites` is available from the **Profile area** on desktop.
- On mobile, `Favorites` is available both in the **Profile area** and in the **hamburger menu**.

## Role-based areas (only if your role allows it)

- Partner users: `Partner Store`
- Admin / Super Admin users: `Admin Dashboard` (and admin tools inside it)

If you do not have the required role, you may see an access denied page (`/403`).

## Task: Find navigation links (desktop)

1. Open `<SITE_URL>` on desktop.
2. In the top navigation, click `Home`, then click `CLStrategies`, then `CLPublishing`.
3. In the footer, click `About`.
4. In the footer, click `Contact Us`.
5. In the footer, click `Privacy` and `Terms`.

What you should see:

- All these pages open without asking you to log in.
- `About` is available in the footer on desktop.

If it doesn’t work:

- Refresh the page once.
- See [09 Troubleshooting](./09-troubleshooting.md).

## Task: Find navigation links (mobile)

1. Open `<SITE_URL>` on a phone (or narrow your browser window).
2. Open the hamburger menu.
3. Click `About` from the hamburger menu.
4. Scroll to the footer and confirm `About` is also available there.

What you should see:

- `About` is available in both the hamburger menu and the footer on mobile.

If it doesn’t work:

- Refresh the page once.
- Try opening `Home` first, then open the menu again.

## Task: Open the store and the cart (guest view)

1. From the top navigation, open the book store (`CLP Book Store` / `Book Store` / `Bookstore`).
2. Open `Cart`.

What you should see:

- The store page opens and shows books.
- `Cart` is visible for guests (you can view it without logging in).

If it doesn’t work:

- Return to `Home` and try again using navigation (don’t type URLs manually).
- If you see `/403`, you opened a role-based page by mistake.

## Task: Find Favorites after login

1. Log in.
2. Open `My Profile`.
3. Find and open `Favorites`.

What you should see:

- Your Favorites list page opens (it may be empty if you have not added any books yet).

If it doesn’t work:

- On mobile, try opening `Favorites` from the hamburger menu.
- See [09 Troubleshooting](./09-troubleshooting.md).
