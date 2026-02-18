# Auth API

## POST `/api/auth/register`

Purpose: Create a new local account.

### Request

- Method: `POST`
- Path: `/api/auth/register`
- Headers: `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `email` | string (email) | Yes | `authRegisterSchema` |
| `password` | string | Yes | `authRegisterSchema` |
| `repeatPassword` | string | Yes | `authRegisterSchema` |
| `fullName` | string | Yes | `authRegisterSchema` |
| `phoneNumber` | string | No | `authRegisterSchema` |
| `role` | string (`user` or `partner`) | Yes | `authRegisterSchema` |
| `newsletter` | boolean | No | `authRegisterSchema` |
| `heardAboutUs` | string | No | `authRegisterSchema` |
| `termsAgreed` | boolean (`true`) | Yes | `authRegisterSchema` |
| `partnerProfile` | object | Conditional | `authRegisterSchema` |

### Responses

Success example (`201`):

```json
{
  "status": "success",
  "code": 201,
  "data": {
    "token": "<JWT>",
    "user": { "id": "<USER_ID>", "email": "<USER_EMAIL>" }
  }
}
```

Error example (`409`):

```json
{ "message": "User already exists" }
```

### Auth notes

- Public endpoint.
- Rate limit middleware is applied.

### Code anchors

- `server/routes/authRoutes.js :: router.post('/register', ...)`
- `server/controllers/authController.js :: registerUser`
- `server/middleware/authLimiter.js :: authLimiter`
- `server/schemas/authSchema.js :: authRegisterSchema`

---

## POST `/api/auth/login`

Purpose: Authenticate with email and password.

### Request

- Method: `POST`
- Path: `/api/auth/login`
- Headers: `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `email` | string (email) | Yes | `authLoginSchema` |
| `password` | string | Yes | `authLoginSchema` |

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
{ "message": "Invalid credentials" }
```

### Auth notes

- Public endpoint.
- Sets refresh cookie `rt` when successful.

### Code anchors

- `server/routes/authRoutes.js :: router.post('/login', ...)`
- `server/controllers/authController.js :: loginUser`
- `server/schemas/authSchema.js :: authLoginSchema`
- `server/utils/cookies.js :: setRefreshCookie`

---

## POST `/api/auth/logout`

Purpose: Clear refresh cookie.

### Request

- Method: `POST`
- Path: `/api/auth/logout`
- Headers: optional

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
  "message": "Logged out successfully"
}
```

Error example:

```json
{ "message": "Implementation-dependent" }
```

### Auth notes

- Route itself does not use `protect` middleware.

### Code anchors

- `server/routes/authRoutes.js :: router.post('/logout', ...)`
- `server/controllers/authController.js :: logoutUser`
- `server/utils/cookies.js :: clearRefreshCookie`

---

## GET `/api/auth/me`

Purpose: Return current authenticated user.

### Request

- Method: `GET`
- Path: `/api/auth/me`
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
  "data": { "id": "<USER_ID>", "email": "<USER_EMAIL>", "role": "user" }
}
```

Error example (`401`):

```json
{ "message": "Not authorized, no token" }
```

### Auth notes

- Protected by JWT middleware.
- Token-version check is enforced in `protect`.

### Code anchors

- `server/routes/authRoutes.js :: router.get('/me', ...)`
- `server/middleware/authMiddleware.js :: protect`
- `server/controllers/authController.js :: getCurrentUser`

---

## POST `/api/auth/google`

Purpose: Authenticate using Google ID token.

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

---

## POST `/api/auth/request-code`

Purpose: Send login/verification code to email.

### Request

- Method: `POST`
- Path: `/api/auth/request-code`
- Headers: `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `email` | string (email) | Yes | `requestLoginCodeSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "Verification code sent to your email"
}
```

Error example (`404`):

```json
{ "message": "User not found" }
```

### Auth notes

- Public endpoint.
- Rate limit middleware is applied.

### Code anchors

- `server/routes/authRoutes.js :: router.post('/request-code', ...)`
- `server/controllers/requestCodeController.js :: requestLoginCode`
- `server/middleware/authLimiter.js :: authLimiter`
- `server/schemas/loginCodeSchemas.js :: requestLoginCodeSchema`

---

## POST `/api/auth/verify-code`

Purpose: Verify code and issue login tokens.

### Request

- Method: `POST`
- Path: `/api/auth/verify-code`
- Headers: `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `email` | string (email) | Yes | `verifyLoginCodeSchema` |
| `code` | string (length 6) | Yes | `verifyLoginCodeSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "Verification successful",
  "data": { "token": "<JWT>", "user": { "id": "<USER_ID>" } }
}
```

Error example (`400`):

```json
{ "message": "Invalid or expired verification code" }
```

### Auth notes

- Public endpoint.
- Sets refresh cookie `rt` on success.

### Code anchors

- `server/routes/authRoutes.js :: router.post('/verify-code', ...)`
- `server/controllers/verifyCodeController.js :: verifyCode`
- `server/schemas/loginCodeSchemas.js :: verifyLoginCodeSchema`
- `server/utils/cookies.js :: setRefreshCookie`

---

## PATCH `/api/auth/reset-password`

Purpose: Change current user password.

### Request

- Method: `PATCH`
- Path: `/api/auth/reset-password`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `oldPassword` | string | Yes | `passwordResetSchema` |
| `newPassword` | string | Yes | `passwordResetSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "message": "Password updated successfully"
}
```

Error example (`401`):

```json
{ "message": "Old password is incorrect" }
```

### Auth notes

- Protected route.
- Rate limit middleware is applied.
- Token invalidation logic is in controller (`tokenVersion++`).

### Code anchors

- `server/routes/authRoutes.js :: router.patch('/reset-password', ...)`
- `server/middleware/authMiddleware.js :: protect`
- `server/controllers/resetPasswordController.js :: resetPassword`
- `server/middleware/authLimiter.js :: authLimiter`
- `server/schemas/passwordResetSchema.js :: passwordResetSchema`

---

## POST `/api/auth/refresh`

Purpose: Rotate refresh token cookie and issue new access token.

### Request

- Method: `POST`
- Path: `/api/auth/refresh`
- Headers: cookie `rt` required

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
  "data": { "token": "<JWT>" }
}
```

Error example (`401`):

```json
{
  "status": "success",
  "code": 401,
  "message": "No refresh token"
}
```

### Auth notes

- Uses cookie-based refresh flow.

### Code anchors

- `server/routes/authRoutes.js :: router.post('/refresh', ...)`
- `server/controllers/refreshController.js :: refreshSession`
- `server/utils/cookies.js :: setRefreshCookie`

---

## PATCH `/api/me/`

Purpose: Update current user profile fields.

### Request

- Method: `PATCH`
- Path: `/api/me/`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `fullName` | string | Optional | `userSelfUpdateSchema` |
| `phoneNumber` | string or null | Optional | `userSelfUpdateSchema` |
| `newsletter` | boolean | Optional | `userSelfUpdateSchema` |
| `heardAboutUs` | string or null | Optional | `userSelfUpdateSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": { "id": "<USER_ID>", "fullName": "<FULL_NAME>" }
}
```

Error example (`400`):

```json
{ "message": "Validation error: ..." }
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/userSelfRoutes.js :: router.use(protect)`
- `server/routes/userSelfRoutes.js :: router.patch('/', ...)`
- `server/controllers/userSelfController.js :: updateMe`
- `server/schemas/meSchemas.js :: userSelfUpdateSchema`

---

## PATCH `/api/me/partner-profile`

Purpose: Upsert partner profile for current user.

### Request

- Method: `PATCH`
- Path: `/api/me/partner-profile`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `organizationName` | string | Conditional | `partnerProfileUpsertSchema` + controller check |
| `businessType` | string/null | Optional | `partnerProfileUpsertSchema` |
| `address` | string/null | Optional | `partnerProfileUpsertSchema` |
| `address2` | string/null | Optional | `partnerProfileUpsertSchema` |
| `billingAddress` | string/null | Optional | `partnerProfileUpsertSchema` |
| `city` | string/null | Optional | `partnerProfileUpsertSchema` |
| `state` | string/null | Optional | `partnerProfileUpsertSchema` |
| `postalCode` | string/null | Optional | `partnerProfileUpsertSchema` |
| `country` | string/null | Optional | `partnerProfileUpsertSchema` |
| `contactPhone` | string/null | Optional | `partnerProfileUpsertSchema` |
| `businessWebsite` | string/null | Optional | `partnerProfileUpsertSchema` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": { "id": "<USER_ID>", "partnerProfile": { "organizationName": "<ORG>" } }
}
```

Error example (`403`):

```json
{ "message": "Only partners can edit partner profile" }
```

### Auth notes

- Controller enforces partner role.

### Code anchors

- `server/routes/userSelfRoutes.js :: router.patch('/partner-profile', ...)`
- `server/controllers/userSelfController.js :: upsertMyPartnerProfile`
- `server/schemas/meSchemas.js :: partnerProfileUpsertSchema`

---

## PowerShell example

```powershell
$body = @{ email = "<USER_EMAIL>"; password = "<PASSWORD>" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "<BASE_URL>/api/auth/login" -ContentType "application/json" -Body $body
```
