# 08 Admin Guide

This section is for users with **Admin** (or **Super Admin**) access.

## Task: Open Admin Dashboard

1. Log in with your admin account.
2. In the top navigation, click `Admin Dashboard`.

What you should see:

- An `Admin Dashboard` page with three main actions:
  - `Add New Book`
  - `User Management`
  - `Send Newsletter`

If it doesn’t work:

- Your account may not have Admin access yet.
- Log out and log in again after your role is changed.

## Task: Add a new book

1. Open `Admin Dashboard`.
2. Click `Add New Book`.
3. Fill in the book details (required fields are marked with `*`).
4. (Optional) Upload a cover image.
5. Click `Create Book`.

What you should see:

- A form with these fields (based on the current UI):
  - `Title *`
  - `Format *` (dropdown, e.g. `Paperback`)
  - `Display order *` (hint in the field: `0 = top of the list`)
  - `Amazon URL` (optional)
  - `Download URL` (optional)
  - `Author *`
  - `Description` (textarea)
  - `Price *`
  - `Partner Price` (optional)
  - `Stock *`
  - `Choose Image` (file picker)
  - `In Stock` (checkbox)
  - `Create Book` (submit button)
- After creation, the new book appears in the store after the operation completes.

If it doesn’t work:

- Check required fields and try again.
- Make sure `Stock` and `Price` are valid numbers.
- If you uploaded an image, try a different file format (JPG/PNG is usually safest).

## Task: Edit an existing book

1. Open the bookstore page as an admin (for example `CLP Book Store`).
2. Find the book you want to change.
3. Use one of these edit entry points:
   - Click the `Edit` button shown on the book card (admin action), or
   - Open the edit route directly: `/admin/books/edit/:id`.
4. Update the fields you need and save.

What you should see:

- The book card shows admin actions (`Edit`, `Delete`).
- Updated book information appears in the store.

If it doesn’t work:

- Refresh and try again.

## Task: Delete a book

1. Open the bookstore page as an admin.
2. Find the book you want to remove.
3. Click `Delete` on the book card.
4. Confirm deletion in the confirmation dialog.

What you should see:

- The book disappears from the list after deletion completes.

If it doesn’t work:

- Refresh the page and check again.

## Task: View and manage users

1. Open `Admin Dashboard`.
2. Click `User Management`.
3. Review the users table:
   - Email
   - Role
   - Created
   - Actions

What you should see:

- A list of users in a table.
- In the `Role` column, most users have a role dropdown.
- A **Super Admin** account is marked with a crown icon next to the email and:
  - shows role as `super admin`,
  - does **not** expose destructive actions like delete (and should not be editable).

If it doesn’t work:

- Refresh the page once.

## Task: Change a user role

1. Open `User Management`.
2. Find the user by email.
3. In the `Role` column, open the role dropdown.
4. Select the new role (as available in your UI, for example: `user`, `partner`, `admin`).

What you should see:

- The role value updates in the table.

If it doesn’t work:

- Refresh the page and check again.
- If the user is marked as `super admin`, you cannot change their role.
- The user may need to log out and log in again for access changes to apply.

## Task: Delete a user

1. Open `User Management`.
2. Find the user you want to remove.
3. Click `Delete`.
4. Confirm in the browser confirmation dialog.

What you should see:

- The user disappears from the list after deletion.

If it doesn’t work:

- Refresh the page and check again.
- If the user is `super admin`, you cannot delete them.

## Task: Send a newsletter

1. Open `Admin Dashboard`.
2. Click `Send Newsletter`.
3. Enter the email `Subject *`.
4. Enter the message `Content (HTML allowed) *`.
5. Click `Send Newsletter`.

What you should see:

- A newsletter form with:
  - `Subject *` input (placeholder: “Enter the subject...”)
  - `Content (HTML allowed) *` textarea (placeholder: “Enter the content...”)
  - `Send Newsletter` button
- A success message after sending (the UI uses “Newsletter sent successfully”).

If it doesn’t work:

- Make sure subject and content are not empty.
- Try once again.

## Task: View all orders (Admin view)

1. Open `My Orders`.
2. Use `Filter by status` to narrow the list (options: `All`, `Pending`, `Completed`).

What you should see:

- Orders list.
- For admins: a `Customer:` line showing the buyer’s name and email.

If it doesn’t work:

- Refresh the page once.

## Task: Update an order status

1. Open `My Orders`.
2. Find the order you want to update.
3. In the admin actions row, change the status using the status dropdown.
   - Available statuses: `pending`, `completed`.

What you should see:

- The order status badge changes to the selected value.

If it doesn’t work:

- Refresh and check the status again.

## Task: Delete an order

1. Open `My Orders`.
2. Find the order you want to remove.
3. Click the trash button labeled `Cancel`.
4. Confirm in the confirmation dialog.

What you should see:

- The order disappears from the list after confirmation.

If it doesn’t work:

- Refresh the orders page and check again.

## Task: Edit website content pages (pages with editor)

1. Open a page that shows `Edit Page`.
2. Click `Edit Page`.
3. Make your changes.
4. Click `Save Draft` to save without publishing.
5. Click `Publish` to make changes visible to all users.

What you should see:

- Editing controls appear only for admins.
- A banner may mention previewing the published version.

If it doesn’t work:

- Try a small change and save again.
- Check [11 Known Issues & Workarounds](./11-known-issues.md) for the Cowboy College Leadership editing issue.
