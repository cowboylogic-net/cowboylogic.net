# 11 Known Issues & Workarounds

This page lists confirmed known issues and practical workarounds.

## Issue 1: Square cancel redirect to `/cancel` is not configured

Only the success redirect is configured in the current checkout flow. If a payment is canceled on the Square side, you may not be redirected back to the correct page automatically.

### Task: Recover after a canceled payment

1. Open `Cart` from the menu.
2. Review your cart items and quantities.
3. Start checkout again when ready.

What you should see:

- Your cart is still available.
- You can retry checkout.

If it doesn't work:

- Go to `Home`, then open `Cart` again from the menu.
- Refresh the `Cart` page once.

---

## Issue 2: CLPublishing Books route casing mismatch

The router uses `/clpublishing/Books`, while at least one mobile link may navigate to `/clpublishing/books`. Because of this casing difference, the page may fail to open depending on hosting/router behavior.

### Task: Open the Books page safely

1. Use the navigation menu (do not type the URL manually).
2. Open `CLPublishing`.
3. Click `Books`.

What you should see:

- The Books page opens when you navigate via the menu.

If it doesn't work:

- Go back to `Home` and repeat using menu navigation.
- Try the desktop navigation (not the mobile menu), if available.

---

## Issue 3: Register redirects to `/dashboard`, but `/dashboard` route does not exist

After registering, you may be redirected to a missing page because `/dashboard` is not implemented.

### Task: Continue after the registration redirect issue

1. If you land on a missing page after registration, open `Home`.
2. Open `Login` and sign in using the account you just created.
3. Continue using account pages such as `My Profile`, `My Orders`, `Cart`, etc.

What you should see:

- You can proceed through `Home` or `Login` without using `/dashboard`.

If it doesn't work:

- Refresh once, then navigate from `Home`.
- If the account was not created successfully, try registering again.

---

## Issue 4: Cowboy College Leadership editable page wiring mismatch (`pageId` vs `slug`)

Admin editing may not work correctly on this specific editable page due to a wiring mismatch (`pageId` vs `slug`). Saving/publishing may fail or not apply.

### Task: Work around the admin editing issue

1. Use editing on other editable pages first to confirm admin editing works in general.
2. On Cowboy College Leadership content, make a small change and test `Save Draft` / `Publish`.
3. If changes do not apply, stop editing and report the issue.

What you should see:

- Other editable pages work normally.
- Cowboy College Leadership may fail to save/publish correctly.

If it doesn't work:

- Escalate to support/admin team and use an alternate content update workflow for that page.
