# Uploads API

## POST `/api/images/upload`

Purpose: Upload an image and return image URLs.

### Request

- Method: `POST`
- Path: `/api/images/upload`
- Headers: `Authorization: Bearer <JWT>`
- Content type: `multipart/form-data`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `image` | file | Yes | `upload.single('image')` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": {
    "imageUrl": "<BASE_URL>/uploads/...",
    "relUrl": "/uploads/..."
  }
}
```

Error example (`400`):

```json
{
  "status": "success",
  "code": 400,
  "message": "No file uploaded"
}
```

### Auth notes

- Protected route.
- Additional non-API alias exists at `/images/upload`.

### Code anchors

- `server/app.js :: app.use('/api/images', imageRoutes)`
- `server/app.js :: app.use('/images', imageRoutes)`
- `server/routes/imageRoutes.js :: router.post('/upload', ...)`
- `server/middleware/authMiddleware.js :: protect`
- `server/middleware/uploadMiddleware.js :: upload`
- `server/middleware/uploadMiddleware.js :: optimizeImage`

---

## PATCH `/api/me/avatar`

Purpose: Upload and set current user avatar image.

### Request

- Method: `PATCH`
- Path: `/api/me/avatar`
- Headers: `Authorization: Bearer <JWT>`
- Content type: `multipart/form-data`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `avatar` | file | Yes | `upload.single('avatar')` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": { "avatarURL": "<BASE_URL>/uploads/avatars/..." }
}
```

Error example (`400`):

```json
{
  "status": "success",
  "code": 400,
  "message": "No avatar uploaded"
}
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/userSelfRoutes.js :: router.use(protect)`
- `server/routes/userSelfRoutes.js :: router.patch('/avatar', ...)`
- `server/controllers/userSelfController.js :: updateAvatar`
- `server/middleware/uploadMiddleware.js :: upload`
- `server/middleware/uploadMiddleware.js :: removeOldAvatar`
- `server/middleware/uploadMiddleware.js :: optimizeImage`

---

## Needs verification

- File system permissions and deployment-level upload directory mount points are runtime/environment concerns.

---

## PowerShell example

```powershell
$headers = @{ Authorization = "Bearer <JWT>" }
$form = @{ image = Get-Item "C:\temp\cover.png" }
Invoke-RestMethod -Method Post -Uri "<BASE_URL>/api/images/upload" -Headers $headers -Form $form
```
