# Google Login API

## Flow summary (verified)

- Frontend wraps app in Google provider with `VITE_GOOGLE_CLIENT_ID`.
- Frontend sends `credential` as `id_token` to backend.
- Backend verifies ID token using `GOOGLE_CLIENT_ID`.

Code anchors:

- `client/src/main.jsx :: GoogleOAuthProvider(clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID)`
- `client/src/components/LoginForm/LoginForm.jsx :: handleGoogleLogin`
- `client/src/components/RegisterForm/RegisterForm.jsx :: handleGoogleSignup`
- `server/controllers/googleAuthController.js :: googleAuth`

## POST `/api/auth/google`

Purpose: Authenticate or create user account using Google ID token.

### Request

- Method: `POST`
- Path: `/api/auth/google`
- Headers: `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `id_token` | string | Yes | `googleAuthSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": {
    "token": "<JWT>",
    "user": { "id": "<USER_ID>", "email": "<USER_EMAIL>" }
  }
}
```

Error example (`401`):

```json
{ "message": "Invalid Google token" }
```

### Auth notes

- Public endpoint.
- Sets refresh cookie `rt` on success.

### Code anchors

- `server/routes/authRoutes.js :: router.post('/google', ...)`
- `server/controllers/googleAuthController.js :: googleAuth`
- `server/schemas/googleAuthSchema.js :: googleAuthSchema`
- `server/utils/cookies.js :: setRefreshCookie`

## Needs verification

- External Google Console settings (authorized origins / app config) are outside repository code.
- `GOOGLE_CLIENT_SECRET` appears in env examples but is not referenced in runtime auth flow files above.

## PowerShell example

```powershell
$body = @{ id_token = "<GOOGLE_ID_TOKEN>" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "<BASE_URL>/api/auth/google" -ContentType "application/json" -Body $body
```
