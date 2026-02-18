# Pages API

## GET `/api/pages/:slug`

Purpose: Get page by slug.

### Request

- Method: `GET`
- Path: `/api/pages/:slug`
- Headers: optional `Authorization: Bearer <JWT>`

### Params

Path params:

| Name | Type | Required | Source |
|---|---|---|---|
| `slug` | string (`^[a-z0-9-]+$`) | Yes | `slugParamSchema` |

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
  "data": { "slug": "home", "content": "<p>...</p>" }
}
```

Error example (`404`):

```json
{ "message": "Page not found" }
```

### Auth notes

- Uses optional auth middleware.

### Code anchors

- `server/routes/pagesRoutes.js :: router.get('/:slug', ...)`
- `server/controllers/pagesController.js :: getPage`
- `server/middleware/optionalAuth.js :: optionalAuth`
- `server/schemas/paramsSchemas.js :: slugParamSchema`

---

## GET `/api/pages/:slug/versions`

Purpose: Get published and draft content (admin).

### Request

- Method: `GET`
- Path: `/api/pages/:slug/versions`
- Headers: `Authorization: Bearer <JWT>`

### Params

Path params:

| Name | Type | Required | Source |
|---|---|---|---|
| `slug` | string (`^[a-z0-9-]+$`) | Yes | `slugParamSchema` |

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
  "data": { "published": "<p>...</p>", "draft": "<p>...</p>" }
}
```

Error example (`404`):

```json
{ "message": "Page not found" }
```

### Auth notes

- Requires `protect` and role gate middleware.

### Code anchors

- `server/routes/pagesRoutes.js :: router.get('/:slug/versions', ...)`
- `server/routes/pagesRoutes.js :: inline ctrlWrapper(async (req,res)=>...)`
- `server/middleware/authMiddleware.js :: protect`
- `server/middleware/requireRole.js :: requireRole`
- `server/schemas/paramsSchemas.js :: slugParamSchema`

---

## PUT `/api/pages/:slug/draft`

Purpose: Save draft content (admin).

### Request

- Method: `PUT`
- Path: `/api/pages/:slug/draft`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

Path params:

| Name | Type | Required |
|---|---|---|
| `slug` | string | Yes |

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `draftContent` | string | Yes | `draftPageSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "Draft saved",
  "data": { "slug": "home" }
}
```

Error example (`400`):

```json
{ "message": "Validation error: ..." }
```

### Auth notes

- Requires `protect` and role gate middleware.

### Code anchors

- `server/routes/pagesRoutes.js :: router.put('/:slug/draft', ...)`
- `server/controllers/pagesController.js :: saveDraft`
- `server/middleware/authMiddleware.js :: protect`
- `server/middleware/requireRole.js :: requireRole`
- `server/schemas/pageSchemas.js :: draftPageSchema`

---

## PUT `/api/pages/:slug`

Purpose: Publish page content (admin).

### Request

- Method: `PUT`
- Path: `/api/pages/:slug`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

Path params:

| Name | Type | Required |
|---|---|---|
| `slug` | string | Yes |

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `content` | string | Yes | `publishPageSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "Page updated",
  "data": { "slug": "home" }
}
```

Error example (`400`):

```json
{ "message": "Validation error: ..." }
```

### Auth notes

- Requires `protect` and role gate middleware.

### Code anchors

- `server/routes/pagesRoutes.js :: router.put('/:slug', ...)`
- `server/controllers/pagesController.js :: updatePage`
- `server/middleware/authMiddleware.js :: protect`
- `server/middleware/requireRole.js :: requireRole`
- `server/schemas/pageSchemas.js :: publishPageSchema`

---

## POST `/api/pages/`

Purpose: Create page (admin).

### Request

- Method: `POST`
- Path: `/api/pages/`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `slug` | string | Yes | `createPageSchema` |
| `content` | string | Yes | `createPageSchema` |

### Responses

Success example (`201`):

```json
{
  "status": "success",
  "code": 201,
  "data": { "id": "<PAGE_ID>", "slug": "home" }
}
```

Error example (`400`):

```json
{ "message": "Page already exists" }
```

### Auth notes

- Requires `protect` and role gate middleware.

### Code anchors

- `server/routes/pagesRoutes.js :: router.post('/', ...)`
- `server/controllers/pagesController.js :: createPage`
- `server/middleware/authMiddleware.js :: protect`
- `server/middleware/requireRole.js :: requireRole`
- `server/schemas/pageSchemas.js :: createPageSchema`

---

## PowerShell example

```powershell
Invoke-RestMethod -Method Get -Uri "<BASE_URL>/api/pages/home"
```
