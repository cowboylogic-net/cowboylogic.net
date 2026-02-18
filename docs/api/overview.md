# API Overview

## Base URL

Use `<BASE_URL>`.

All documented public API endpoints are under `/api/*`.

## Source of Truth

Use the route inventory as the primary verification map:

- [Route Inventory](./routes-inventory.md)

## Auth Model (Verified)

- Access token: `Authorization: Bearer <JWT>`
- Refresh token: HTTP-only cookie `rt` on path `/api/auth`

Code anchors:

- `server/middleware/authMiddleware.js :: protect`
- `server/utils/cookies.js :: setRefreshCookie`
- `server/utils/cookies.js :: clearRefreshCookie`

## Role Gating (Verified)

- Role checks use `requireRole(...)` and `isAdmin*` middleware.
- `isSuperAdmin === true` bypass is present in `requireRole`.

Code anchors:

- `server/middleware/requireRole.js :: requireRole`
- `server/middleware/authMiddleware.js :: isAdmin`
- `server/middleware/authMiddleware.js :: isAdminOrSuperAdmin`

## Response Format (Verified)

Common success envelope:

```json
{
  "status": "success",
  "code": 200,
  "message": "Optional",
  "data": {}
}
```

Code anchor:

- `server/utils/sendResponse.js :: sendResponse`

Common error envelopes:

```json
{ "message": "Error text" }
```

and for some middleware paths:

```json
{ "status": "fail", "code": 400, "message": "Error text" }
```

Code anchors:

- `server/middleware/errorMiddleware.js :: errorHandler`
- `server/middleware/validateQuery.js :: validateQuery`
- `server/middleware/verifySquareSignature.js :: verifySquareSignature`

## PowerShell Example

```powershell
$headers = @{ Authorization = "Bearer <JWT>" }
Invoke-RestMethod -Method Get -Uri "<BASE_URL>/api/auth/me" -Headers $headers
```
