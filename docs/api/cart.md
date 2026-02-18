# Cart API

## GET `/api/cart/`

Purpose: Get current user cart items.

### Request

- Method: `GET`
- Path: `/api/cart/`
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
  "data": [{ "id": "<CART_ITEM_ID>", "quantity": 1 }]
}
```

Error example (`401`):

```json
{ "message": "Not authorized, no token" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/cartRoutes.js :: router.use(protect)`
- `server/routes/cartRoutes.js :: router.get('/', ...)`
- `server/controllers/cartController.js :: getCart`

---

## POST `/api/cart/`

Purpose: Add item to cart.

### Request

- Method: `POST`
- Path: `/api/cart/`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `bookId` | UUID | Yes | `addToCartSchema` |
| `quantity` | integer | Optional | `addToCartSchema` |

### Responses

Success example (`201` or `200`):

```json
{
  "status": "success",
  "code": 201,
  "data": { "id": "<CART_ITEM_ID>", "bookId": "<BOOK_ID>", "quantity": 2 }
}
```

Error example (`400`):

```json
{ "message": "Only 1 items left in stock" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.
- Partner minimum quantity checks are in controller.

### Code anchors

- `server/routes/cartRoutes.js :: router.use(protect)`
- `server/routes/cartRoutes.js :: router.post('/', ...)`
- `server/controllers/cartController.js :: addToCart`
- `server/schemas/cartSchemas.js :: addToCartSchema`

---

## PATCH `/api/cart/:itemId`

Purpose: Update cart item quantity.

### Request

- Method: `PATCH`
- Path: `/api/cart/:itemId`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

Path params:

| Name | Type | Required | Source |
|---|---|---|---|
| `itemId` | UUID | Yes | `cartItemIdParamSchema` |

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `quantity` | integer | Yes | `updateQuantitySchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": { "id": "<CART_ITEM_ID>", "quantity": 3 }
}
```

Error example (`404`):

```json
{ "message": "Cart item not found" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/cartRoutes.js :: router.use(protect)`
- `server/routes/cartRoutes.js :: router.patch('/:itemId', ...)`
- `server/controllers/cartController.js :: updateQuantity`
- `server/schemas/paramsSchemas.js :: cartItemIdParamSchema`
- `server/schemas/cartSchemas.js :: updateQuantitySchema`

---

## DELETE `/api/cart/:itemId`

Purpose: Delete one cart item.

### Request

- Method: `DELETE`
- Path: `/api/cart/:itemId`
- Headers: `Authorization: Bearer <JWT>`

### Params

Path params:

| Name | Type | Required | Source |
|---|---|---|---|
| `itemId` | UUID | Yes | `cartItemIdParamSchema` |

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
  "message": "Item deleted"
}
```

Error example (`404`):

```json
{ "message": "Cart item not found" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/cartRoutes.js :: router.use(protect)`
- `server/routes/cartRoutes.js :: router.delete('/:itemId', ...)`
- `server/controllers/cartController.js :: deleteItem`
- `server/schemas/paramsSchemas.js :: cartItemIdParamSchema`

---

## DELETE `/api/cart/`

Purpose: Clear current user cart.

### Request

- Method: `DELETE`
- Path: `/api/cart/`
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
  "message": "Cart cleared"
}
```

Error example (`401`):

```json
{ "message": "Not authorized, no token" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/cartRoutes.js :: router.use(protect)`
- `server/routes/cartRoutes.js :: router.delete('/', ...)`
- `server/controllers/cartController.js :: clearCart`

---

## PowerShell example

```powershell
$headers = @{ Authorization = "Bearer <JWT>"; "Content-Type" = "application/json" }
$body = @{ bookId = "<BOOK_ID>"; quantity = 2 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "<BASE_URL>/api/cart/" -Headers $headers -Body $body
```
