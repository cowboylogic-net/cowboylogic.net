# Admin API

There is no dedicated `/api/admin/*` route group.

Admin access is enforced on selected endpoints via middleware.

## Admin middleware anchors

- `server/middleware/authMiddleware.js :: isAdmin`
- `server/middleware/authMiddleware.js :: isAdminOrSuperAdmin`
- `server/middleware/requireRole.js :: requireRole`

## Admin-gated route index

| Method | Full path | Route anchor | Middleware chain anchor | Detailed docs |
|---|---|---|---|---|
| POST | `/api/books/` | `server/routes/bookRoutes.js :: router.post('/', ...)` | `protect` + `isAdmin` | `books.md` |
| PUT | `/api/books/:id` | `server/routes/bookRoutes.js :: router.put('/:id', ...)` | `protect` + `isAdmin` | `books.md` |
| DELETE | `/api/books/:id` | `server/routes/bookRoutes.js :: router.delete('/:id', ...)` | `protect` + `isAdmin` | `books.md` |
| GET | `/api/orders/all` | `server/routes/orderRoutes.js :: router.get('/all', ...)` | router `use(protect)` + `requireRole('admin','superAdmin')` | `orders.md` |
| PATCH | `/api/orders/:id/status` | `server/routes/orderRoutes.js :: router.patch('/:id/status', ...)` | router `use(protect)` + `requireRole('admin','superAdmin')` | `orders.md` |
| DELETE | `/api/orders/:id` | `server/routes/orderRoutes.js :: router.delete('/:id', ...)` | router `use(protect)` + `requireRole('admin','superAdmin')` | `orders.md` |
| GET | `/api/pages/:slug/versions` | `server/routes/pagesRoutes.js :: router.get('/:slug/versions', ...)` | `protect` + `requireRole('admin','superAdmin')` | `pages.md` |
| PUT | `/api/pages/:slug/draft` | `server/routes/pagesRoutes.js :: router.put('/:slug/draft', ...)` | `protect` + `requireRole('admin','superAdmin')` | `pages.md` |
| PUT | `/api/pages/:slug` | `server/routes/pagesRoutes.js :: router.put('/:slug', ...)` | `protect` + `requireRole('admin','superAdmin')` | `pages.md` |
| POST | `/api/pages/` | `server/routes/pagesRoutes.js :: router.post('/', ...)` | `protect` + `requireRole('admin','superAdmin')` | `pages.md` |
| POST | `/api/newsletter/send` | `server/routes/newsletterRoutes.js :: router.post('/send', ...)` | `protect` + `requireRole('admin','superAdmin')` | `contacts-and-newsletter.md` |
| GET | `/api/users/` | `server/routes/userRoutes.js :: router.get('/', ...)` | `router.use(protect, isAdminOrSuperAdmin, logSuperAdminAccess)` | `admin.md` |
| PATCH | `/api/users/:id/role` | `server/routes/userRoutes.js :: router.patch('/:id/role', ...)` | `router.use(protect, isAdminOrSuperAdmin, logSuperAdminAccess)` | `admin.md` |
| DELETE | `/api/users/:id` | `server/routes/userRoutes.js :: router.delete('/:id', ...)` | `router.use(protect, isAdminOrSuperAdmin, logSuperAdminAccess)` | `admin.md` |

---

## GET `/api/users/`

Purpose: List users (admin/superAdmin).

### Request

- Method: `GET`
- Path: `/api/users/`
- Headers: `Authorization: Bearer <JWT>`

### Params

Query params:

| Name | Type | Required |
|---|---|---|
| `limit` | integer | Optional |
| `offset` | integer | Optional |

### Body schema

| Field | Type | Required |
|---|---|---|
| None | - | - |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": [{ "id": "<USER_ID>", "email": "<USER_EMAIL>", "role": "user" }]
}
```

Error example (`403`):

```json
{ "message": "Access denied. Admins only." }
```

### Auth notes

- Route group applies `protect` and `isAdminOrSuperAdmin` at router level.

### Code anchors

- `server/routes/userRoutes.js :: router.use(protect, isAdminOrSuperAdmin, logSuperAdminAccess)`
- `server/routes/userRoutes.js :: router.get('/', ...)`
- `server/controllers/userController.js :: getAllUsers`

---

## PATCH `/api/users/:id/role`

Purpose: Update user role (admin/superAdmin).

### Request

- Method: `PATCH`
- Path: `/api/users/:id/role`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

Path params:

| Name | Type | Required | Source |
|---|---|---|---|
| `id` | UUID | Yes | `idParamSchema` |

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `role` | string (`user`/`partner`/`admin`) | Yes | `userRoleSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "User role updated",
  "data": { "id": "<USER_ID>", "role": "partner" }
}
```

Error example (`403`):

```json
{ "message": "Cannot assign super admin role" }
```

### Auth notes

- Route group applies `protect` and `isAdminOrSuperAdmin` at router level.

### Code anchors

- `server/routes/userRoutes.js :: router.use(protect, isAdminOrSuperAdmin, logSuperAdminAccess)`
- `server/routes/userRoutes.js :: router.patch('/:id/role', ...)`
- `server/controllers/userController.js :: updateUserRole`
- `server/schemas/paramsSchemas.js :: idParamSchema`
- `server/schemas/userRoleSchema.js :: userRoleSchema`

---

## DELETE `/api/users/:id`

Purpose: Delete user (admin/superAdmin).

### Request

- Method: `DELETE`
- Path: `/api/users/:id`
- Headers: `Authorization: Bearer <JWT>`

### Params

Path params:

| Name | Type | Required | Source |
|---|---|---|---|
| `id` | UUID | Yes | `idParamSchema` |

### Body schema

| Field | Type | Required |
|---|---|---|
| None | - | - |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "User deleted",
  "data": { "id": "<USER_ID>" }
}
```

Error example (`403`):

```json
{ "message": "Cannot delete a super admin" }
```

### Auth notes

- Route group applies `protect` and `isAdminOrSuperAdmin` at router level.

### Code anchors

- `server/routes/userRoutes.js :: router.use(protect, isAdminOrSuperAdmin, logSuperAdminAccess)`
- `server/routes/userRoutes.js :: router.delete('/:id', ...)`
- `server/controllers/userController.js :: deleteUser`
- `server/schemas/paramsSchemas.js :: idParamSchema`

---

## Needs verification

- Which human operators should have admin/superAdmin rights is a business process decision outside repository code.
