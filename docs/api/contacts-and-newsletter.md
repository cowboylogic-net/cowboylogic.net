# Contact and Newsletter API

## POST `/api/contact/`

Purpose: Submit contact form payload.

### Request

- Method: `POST`
- Path: `/api/contact/`
- Headers: `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `firstName` | string | Yes | `contactSchema` |
| `lastName` | string | Yes | `contactSchema` |
| `email` | string (email) | Yes | `contactSchema` |
| `message` | string | Conditional | `contactSchema` |
| `comment` | string | Conditional | `contactSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "Message sent successfully"
}
```

Error example (`400`):

```json
{ "message": "Validation error: ..." }
```

### Auth notes

- Public endpoint.

### Code anchors

- `server/routes/contactRoutes.js :: router.post('/', ...)`
- `server/controllers/contactController.js :: sendContactEmail`
- `server/schemas/contactSchema.js :: contactSchema`

---

## POST `/api/newsletter/subscribe`

Purpose: Add subscriber email.

### Request

- Method: `POST`
- Path: `/api/newsletter/subscribe`
- Headers: `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `email` | string (email) | Yes | `subscribeSchema` |

### Responses

Success example (`201`):

```json
{
  "status": "success",
  "code": 201,
  "message": "Subscribed successfully"
}
```

Error example (`409`):

```json
{ "message": "Email already subscribed" }
```

### Auth notes

- Public endpoint.

### Code anchors

- `server/routes/newsletterRoutes.js :: router.post('/subscribe', ...)`
- `server/controllers/newsletterController.js :: subscribe`
- `server/schemas/newsletterSchemas.js :: subscribeSchema`

---

## POST `/api/newsletter/unsubscribe`

Purpose: Remove subscriber email.

### Request

- Method: `POST`
- Path: `/api/newsletter/unsubscribe`
- Headers: `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `email` | string (email) | Yes | `subscribeSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "Unsubscribed"
}
```

Error example (`400`):

```json
{ "message": "Email is required" }
```

### Auth notes

- Public endpoint.

### Code anchors

- `server/routes/newsletterRoutes.js :: router.post('/unsubscribe', ...)`
- `server/controllers/newsletterController.js :: unsubscribe`
- `server/schemas/newsletterSchemas.js :: subscribeSchema`

---

## POST `/api/newsletter/send`

Purpose: Send newsletter email (admin).

### Request

- Method: `POST`
- Path: `/api/newsletter/send`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `subject` | string | Yes | `sendSchema` |
| `content` | string | Yes | `sendSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "Newsletter sent",
  "data": { "recipients": 10, "failed": [] }
}
```

Error example (`403`):

```json
{ "message": "Forbidden: Access denied." }
```

### Auth notes

- Requires `protect` and role gate middleware.

### Code anchors

- `server/routes/newsletterRoutes.js :: router.post('/send', ...)`
- `server/controllers/newsletterController.js :: sendNewsletter`
- `server/middleware/authMiddleware.js :: protect`
- `server/middleware/requireRole.js :: requireRole`
- `server/schemas/newsletterSchemas.js :: sendSchema`

---

## PowerShell example

```powershell
$body = @{ email = "<USER_EMAIL>" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "<BASE_URL>/api/newsletter/subscribe" -ContentType "application/json" -Body $body
```
