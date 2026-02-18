# 09 Troubleshooting

Use these quick fixes for common problems.

## Task: "I cannot log in"

1. Try logging in again with email + password.
2. If prompted, complete email code verification.
3. If available, try `Continue with Google` as an alternative login method.
4. If you were already logged in but got logged out, refresh once and try again.

What you should see:

- Successful login and access to account pages (for example: `My Profile`, `My Orders`).

If it doesn't work:

- Re-enter your email/password carefully (no extra spaces).
- Try a different browser or an Incognito/Private window.
- Contact `<SUPPORT_EMAIL>` and include your `<USER_EMAIL>` and what you tried.

## Task: "I see Access Denied"

1. Check which page you opened.
2. If it is `Partner Store`, make sure your account has the `partner` role (or admin with partner access).
3. If it is `Admin Dashboard`, make sure your account has `admin` or `super admin` access.
4. After a role change, log out and log in again.

What you should see:

- The page opens when your role allows it.

If it doesn't work:

- Open the page from the site navigation (do not use an old bookmarked link).
- Ask an admin to confirm your current role in `Admin Dashboard → User Management`.

## Task: "Checkout failed or payment was canceled"

1. Open `Cart`.
2. Review each item:
   - Make sure it is **in stock**.
   - Ensure quantity does not exceed stock.
3. If you are checking out partner items, confirm **minimum quantity is 5 per item**.
4. Start checkout again.

What you should see:

- Checkout opens and can be completed.

If it doesn't work:

- Remove the item(s) that show stock/quantity issues and retry.
- Try checkout again after refreshing the cart page once.
- Review [11 Known Issues & Workarounds](./11-known-issues.md).

## Task: "My order is not visible yet"

1. Open `My Orders`.
2. Wait a short moment after payment, then refresh once.
3. Check the status filter and set it to `All` (if available).

What you should see:

- The new order appears after confirmation completes.

If it doesn't work:

- Refresh once more after a short wait (do not spam refresh).
- If payment was canceled, no new order will be created.
- Contact support and include: approximate payment time, your `<USER_EMAIL>`, and what status you saw on the payment/success page.

## Task: "A page link behaves oddly"

1. Use the navigation menu instead of typing URLs or using old bookmarks.
2. Navigate through main menu links (for example: `Home`, `CLPublishing`, `CLP Book Store`, `Partner Store`).
3. If something looks wrong on mobile, open the same page on desktop to confirm whether it is a mobile-only issue.

What you should see:

- Stable navigation and correct pages opening from the menu.

If it doesn't work:

- Hard refresh the page (Ctrl+F5 / Cmd+Shift+R).
- Check [11 Known Issues & Workarounds](./11-known-issues.md) for current route/link limitations.
