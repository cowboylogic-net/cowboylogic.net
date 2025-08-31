# Roles and Permissions

This file defines the access levels and permissions available to different user roles in the Cowboylogic Strategies / Publishing system.

---

## 👤 Role: User

Standard user of the platform.

### Permissions:
- View books
- Reset own password
- Add items to cart
- Place orders
- Subscribe to newsletter
- View static content pages
- Send contact messages

---

## 🛠️ Role: Admin

Has access to content management features but not to user management.

### Permissions:
- All User permissions
- Add / Edit / Delete books
- Edit page content
- Send newsletters
- View all orders

### Restrictions:
- Cannot assign roles to other users
- Cannot delete or manage superadmins

---

## 🧙‍♂️ Role: SuperAdmin

Has full control over the system.

### Permissions:
- All Admin permissions
- Manage users (view, delete, assign roles)
- Change roles of any user
- Create new static pages
- Cannot be deleted from the system

---

🔒 Protected Endpoints:

| Endpoint                     | Admin | SuperAdmin |
|-----------------------------|:-----:|:----------:|
| `POST /api/books`           |  ✅   |     ✅     |
| `PUT /api/pages/:slug`      |  ✅   |     ✅     |
| `POST /api/newsletter/send`|  ✅   |     ✅     |
| `GET /api/users`            |       |     ✅     |
| `PATCH /api/users/:id/role`|       |     ✅     |
| `DELETE /api/users/:id`     |       |     ✅     |

---

🛡 Note: Role permissions are enforced via middleware checks in Express, and SuperAdmin is protected from deletion explicitly in business logic.