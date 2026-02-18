# Orders API

## POST `/api/orders/`

Purpose: Create an order from current cart.

### Request

- Method: `POST`
- Path: `/api/orders/`
- Headers: `Authorization: Bearer <JWT>`

### Params

- None.

### Body schema

| Field | Type | Required |
|---|---|---|
| None | - | - |

### Responses

Success example (`201`):

```json
{
  "status": "success",
  "code": 201,
  "message": "Order placed",
  "data": { "orderId": "<ORDER_ID>" }
}
```

Error example (`400`):

```json
{ "message": "Cart is empty" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.
- Partner minimum quantity and partner pricing checks are enforced in controller.

### Code anchors

- `server/routes/orderRoutes.js :: router.use(protect)`
- `server/routes/orderRoutes.js :: router.post('/', ...)`
- `server/controllers/orderController.js :: createOrder`

---

## GET `/api/orders/`

Purpose: List orders for current user.

### Request

- Method: `GET`
- Path: `/api/orders/`
- Headers: `Authorization: Bearer <JWT>`

### Params

- None.

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
  "data": [{ "id": "<ORDER_ID>", "status": "pending" }]
}
```

Error example (`401`):

```json
{ "message": "Not authorized, no token" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/orderRoutes.js :: router.use(protect)`
- `server/routes/orderRoutes.js :: router.get('/', ...)`
- `server/controllers/orderController.js :: getUserOrders`

---

## GET `/api/orders/latest`

Purpose: Get latest order for current user.

### Request

- Method: `GET`
- Path: `/api/orders/latest`
- Headers: `Authorization: Bearer <JWT>`

### Params

- None.

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
  "data": { "id": "<ORDER_ID>", "status": "completed" }
}
```

Alternative response (`204`): empty body when no latest order.

Error example (`401`):

```json
{ "message": "Not authorized, no token" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/orderRoutes.js :: router.use(protect)`
- `server/routes/orderRoutes.js :: router.get('/latest', ...)`
- `server/controllers/orderController.js :: getLatestOrder`

---

## POST `/api/orders/confirm`

Purpose: Confirm/materialize order using Square identifiers.

### Request

- Method: `POST`
- Path: `/api/orders/confirm`
- Headers: `Authorization: Bearer <JWT>`

### Params

Query/body fields read by controller:

| Name | Type | Required |
|---|---|---|
| `paymentId` | string | Conditional |
| `orderId` | string | Conditional |

### Body schema

| Field | Type | Required |
|---|---|---|
| `paymentId` | string | Conditional |
| `orderId` | string | Conditional |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": { "id": "<ORDER_ID>", "status": "completed" }
}
```

Alternative response (`202`):

```json
{ "status": "pending" }
```

Alternative response (`204`): empty body.

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/orderRoutes.js :: router.use(protect)`
- `server/routes/orderRoutes.js :: router.post('/confirm', ...)`
- `server/controllers/orderController.js :: confirmSquareOrder`
- `server/utils/materializeSquareOrder.js :: materializeSquareOrder`

---

## GET `/api/orders/all`

Purpose: List all orders (admin).

### Request

- Method: `GET`
- Path: `/api/orders/all`
- Headers: `Authorization: Bearer <JWT>`

### Params

- None.

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
  "data": [{ "id": "<ORDER_ID>", "status": "pending" }]
}
```

Error example (`403`):

```json
{ "message": "Forbidden: Access denied." }
```

### Auth notes

- Requires `protect` and role gate middleware.

### Code anchors

- `server/routes/orderRoutes.js :: router.use(protect)`
- `server/routes/orderRoutes.js :: router.get('/all', requireRole('admin', 'superAdmin'), ...)`
- `server/middleware/requireRole.js :: requireRole`
- `server/controllers/orderController.js :: getAllOrders`

---

## PATCH `/api/orders/:id/status`

Purpose: Update order status (admin).

### Request

- Method: `PATCH`
- Path: `/api/orders/:id/status`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

Path params:

| Name | Type | Required | Source |
|---|---|---|---|
| `id` | UUID | Yes | `idParamSchema` |

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `status` | string (`pending` or `completed`) | Yes | `updateOrderStatusSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "Order status updated",
  "data": { "id": "<ORDER_ID>", "status": "completed" }
}
```

Error example (`404`):

```json
{ "message": "Order not found" }
```

### Auth notes

- Requires `protect` and role gate middleware.

### Code anchors

- `server/routes/orderRoutes.js :: router.use(protect)`
- `server/routes/orderRoutes.js :: router.patch('/:id/status', ...)`
- `server/middleware/requireRole.js :: requireRole`
- `server/controllers/orderController.js :: updateOrderStatus`
- `server/schemas/paramsSchemas.js :: idParamSchema`
- `server/schemas/orderSchemas.js :: updateOrderStatusSchema`

---

## DELETE `/api/orders/:id`

Purpose: Delete order (admin).

### Request

- Method: `DELETE`
- Path: `/api/orders/:id`
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
  "message": "Order deleted"
}
```

Error example (`403`):

```json
{ "message": "Only admins can delete orders" }
```

### Auth notes

- Requires `protect` and role gate middleware.

### Code anchors

- `server/routes/orderRoutes.js :: router.use(protect)`
- `server/routes/orderRoutes.js :: router.delete('/:id', ...)`
- `server/middleware/requireRole.js :: requireRole`
- `server/controllers/orderController.js :: deleteOrder`
- `server/schemas/paramsSchemas.js :: idParamSchema`

---

## PowerShell example

```powershell
$headers = @{ Authorization = "Bearer <JWT>" }
Invoke-WebRequest -Method Get -Uri "<BASE_URL>/api/orders/latest" -Headers $headers
```
