# Square API

> [!WARNING]
> **UNSAFE configuration path exists:** if `SQUARE_WEBHOOK_SIGNATURE_KEY` is empty, webhook signature verification is skipped and request processing continues.
>
> Verified in code: `server/middleware/verifySquareSignature.js :: if (!secret) { ... return next(); }`.

## POST `/api/square/create-payment`

Purpose: Create Square hosted checkout URL.

### Request

- Method: `POST`
- Path: `/api/square/create-payment`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| body | array of `{ bookId, quantity }` | Yes | `paymentSchema` (controller-level Joi) |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": { "checkoutUrl": "https://square.link/..." }
}
```

Error example (`500`):

```json
{ "message": "Failed to create payment" }
```

### Auth notes

- Protected route.
- Partner minimum quantity per title is enforced in controller.
- Success redirect URL uses `SQUARE_SUCCESS_URL` in checkout options.
- Cancel redirect is not set in checkout options.

### Code anchors

- `server/routes/squareRoutes.js :: router.post('/create-payment', ...)`
- `server/controllers/squareController.js :: createPaymentHandler`
- `server/controllers/squareController.js :: paymentSchema`
- `server/controllers/squareController.js :: checkoutOptions.redirectUrl`
- `server/middleware/authMiddleware.js :: protect`

---

## POST `/api/square/webhook`

Purpose: Receive Square webhook events.

### Request

- Method: `POST`
- Path: `/api/square/webhook`
- Headers: Square signature headers and raw body payload

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| raw body | bytes (`express.raw`) | Yes | `app.post('/api/square/webhook', express.raw(...), ...)` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": { "received": true }
}
```

Error example (`400`):

```json
{ "status": "fail", "code": 400, "message": "Invalid Square signature" }
```

### Auth notes

- Uses signature middleware, not JWT.
- Signature URL source is `SQUARE_WEBHOOK_NOTIFICATION_URL` fallback to runtime URL.

### Code anchors

- `server/app.js :: app.post('/api/square/webhook', ...)`
- `server/middleware/verifySquareSignature.js :: verifySquareSignature`
- `server/controllers/webhookController.js :: squareWebhookHandler`

---

## GET `/api/square/_ping`

Purpose: Health endpoint for webhook/tunnel connectivity checks.

### Request

- Method: `GET`
- Path: `/api/square/_ping`
- Headers: none

### Params

- None.

### Body schema

| Field | Type | Required |
|---|---|---|
| None | - | - |

### Responses

Success response: `204 No Content`.

Error example:

```json
{ "message": "Implementation-dependent" }
```

### Auth notes

- Public endpoint.

### Code anchors

- `server/app.js :: app.get('/api/square/_ping', ...)`

---

## Needs verification

- External Square Dashboard setup (webhook destination values, app settings) is not in repository code.
- Runtime environment values (`SQUARE_*`) are not documented with real values by design.

---

## PowerShell example

```powershell
$headers = @{ Authorization = "Bearer <JWT>"; "Content-Type" = "application/json" }
$body = @(
  @{ bookId = "<BOOK_ID>"; quantity = 2 }
) | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "<BASE_URL>/api/square/create-payment" -Headers $headers -Body $body
```
