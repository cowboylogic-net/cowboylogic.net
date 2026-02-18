# Smoke Checklist (10-15 Minutes)

Run this checklist after deployment or before release sign-off. Stop and log issues in `docs/qa/bug-ledger.md` when any step fails.

## Preconditions

- Frontend and backend are running.
- Test accounts are available:
  - regular user
  - admin user
  - partner user

## Checklist

1. Login persistence on reload
   - Log in as a regular user.
   - Refresh the browser tab.
   - Expected: user stays authenticated; no redirect to login.

2. Login and logout baseline
   - Log out.
   - Log back in.
   - Expected: logout clears protected access; login restores it.

3. Book list to details navigation
   - Open the public book list.
   - Open a book details page from the list.
   - Expected: details view loads; cover image renders (no broken image placeholder).

4. Edit book image preview
   - Log in as admin and open edit book form.
   - Choose a replacement image file.
   - Expected: image preview updates before save.

5. Cart add/remove/update flow
   - Add at least one book to cart.
   - Update quantity.
   - Remove an item.
   - Expected: totals and item list stay consistent after each action.

6. Partner store filter behavior
   - Log in as partner and open partner store.
   - Apply at least one filter and clear it.
   - Expected: filtered results change correctly, then return to full set when cleared.

7. Orders page as regular user
   - Open orders page as user.
   - Expected: loading state appears, then either populated list or clear empty state; API failures show readable error state.

8. Orders page as admin
   - Open orders page or admin orders view as admin.
   - Expected: loading, empty, and error states are visually consistent with user view patterns.

9. Hard refresh on critical routes
   - Hard refresh on `/bookstore`, `/cart`, and `/orders`.
   - Expected: each route reloads without crash or forced logout (unless already logged out).

10. Console and network sanity check
   - During steps above, keep DevTools open.
   - Expected: no uncaught runtime exceptions and no repeated failing API loops.

