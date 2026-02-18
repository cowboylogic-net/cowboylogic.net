# 05 Cart and Checkout

This section explains cart actions and the Square checkout flow.

## Task: Open your cart

1. Click `Cart` in the top navigation (desktop) or in the burger menu (mobile).
2. Review items and quantities.

What you should see:

- Cart list with your selected books.
- `Total` amount at the bottom.

If it doesn't work:

- Add at least one book first.
- Refresh the cart page.

## Task: Change item quantity

1. In `Cart`, increase or decrease quantity using the quantity controls.
2. Click outside the quantity field to apply the change.

What you should see:

- A success toast (green) after the quantity is updated.
- The total amount updates.

If it doesn't work:

- Try changing the quantity again once.
- Quantity cannot go below `1`.
- Stock limits may block increasing quantity (the UI won’t let you go above available stock).
- For partner accounts, quantity must be at least `5` per item (see below).

## Task: Partner minimum quantity rule (Partner accounts)

1. In `Cart`, try setting an item quantity below `5`.

What you should see:

- A warning toast about the minimum partner quantity.
- The quantity change is not applied.

## Task: Remove an item from cart

1. In `Cart`, click `Remove` on the item.

What you should see:

- A success toast (green).
- The item disappears from the cart.
- The total amount updates.

If it doesn't work:

- Refresh the page and try again.

## Task: Start checkout (Square)

1. In `Cart`, click the checkout button (`Checkout with Square`).
2. Complete payment on the Square page.

What you should see:

- You are redirected to Square checkout in the same browser tab.
- After payment, you return to the site success flow.

If it doesn't work:

- If you are not logged in, checkout is not available. Instead you see buttons like `Login to buy` and `Register to buy`.
- If an item becomes out of stock, checkout is blocked and an error toast is shown.

## Task: Confirm successful payment

1. After payment, wait on the success page.
2. Let the page finish order confirmation.
3. Use `View orders`, or wait for auto-redirect.

What you should see:

- Confirmation completes and the cart is cleared.
- A confirmed order message (with order id when available).
- Auto-redirect to `My Orders` after ~5 seconds once the order id is available.

If it doesn't work:

- If confirmation fails, an error message/toast is shown.
- Open `My Orders` manually from the menu if needed.

## Task: Handle canceled payment

1. If payment is canceled, you land on the cancel page.
2. Use the button to return to `Cart`, or wait for auto-redirect.

What you should see:

- Cancellation notification.
- A button to return to `Cart`.
- Auto-redirect to `/cart` after ~5 seconds.

If it doesn't work:

- Use menu `Cart` directly.
