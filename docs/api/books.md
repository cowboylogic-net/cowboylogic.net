# Books, Search, Favorites API

## GET `/api/books/`

Purpose: List books with pagination and sorting.

### Request

- Method: `GET`
- Path: `/api/books/`
- Headers: optional `Authorization: Bearer <JWT>`

### Params

Query params:

| Name | Type | Required | Source |
|---|---|---|---|
| `page` | integer | Optional | `booksQuerySchema` |
| `limit` | integer | Optional | `booksQuerySchema` |
| `sortBy` | string | Optional | `booksQuerySchema` |
| `order` | string | Optional | `booksQuerySchema` |

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
  "data": {
    "items": [{ "id": "<BOOK_ID>", "title": "<TITLE>" }],
    "meta": { "page": 1, "limit": 12 }
  }
}
```

Error example (`400`):

```json
{ "status": "fail", "code": 400, "message": "Invalid query params" }
```

### Auth notes

- Optional auth middleware is used.

### Code anchors

- `server/routes/bookRoutes.js :: router.get('/', ...)`
- `server/controllers/bookController.js :: getBooks`
- `server/middleware/optionalAuth.js :: optionalAuth`
- `server/schemas/paginationSchema.js :: booksQuerySchema`

---

## GET `/api/books/:id`

Purpose: Get one book by ID.

### Request

- Method: `GET`
- Path: `/api/books/:id`
- Headers: optional `Authorization: Bearer <JWT>`

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
  "data": { "id": "<BOOK_ID>", "title": "<TITLE>" }
}
```

Error example (`404`):

```json
{ "message": "Book not found" }
```

### Auth notes

- Optional auth middleware is used.

### Code anchors

- `server/routes/bookRoutes.js :: router.get('/:id', ...)`
- `server/controllers/bookController.js :: getBookById`
- `server/schemas/paramsSchemas.js :: idParamSchema`

---

## GET `/api/books/partner-books`

Purpose: List wholesale books for partner/admin/superAdmin roles.

### Request

- Method: `GET`
- Path: `/api/books/partner-books`
- Headers: `Authorization: Bearer <JWT>`

### Params

Query params:

| Name | Type | Required | Source |
|---|---|---|---|
| `page` | integer | Optional | `partnerBooksQuerySchema` |
| `limit` | integer | Optional | `partnerBooksQuerySchema` |
| `sortBy` | string | Optional | `partnerBooksQuerySchema` |
| `order` | string | Optional | `partnerBooksQuerySchema` |

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
  "data": {
    "items": [{ "id": "<BOOK_ID>", "partnerPrice": "<PRICE>" }],
    "meta": { "page": 1, "limit": 12 }
  }
}
```

Error example (`403`):

```json
{ "message": "Forbidden: Access denied." }
```

### Auth notes

- Requires `protect` plus role gate.

### Code anchors

- `server/routes/bookRoutes.js :: router.get('/partner-books', ...)`
- `server/controllers/bookController.js :: getPartnerBooks`
- `server/middleware/authMiddleware.js :: protect`
- `server/middleware/requireRole.js :: requireRole`
- `server/schemas/paginationSchema.js :: partnerBooksQuerySchema`

---

## POST `/api/books/check-stock`

Purpose: Validate requested quantities against stock.

### Request

- Method: `POST`
- Path: `/api/books/check-stock`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `items` | array of `{ bookId, quantity }` | Yes (or body can be array directly) | Controller logic |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": { "success": true }
}
```

Error example (`400`):

```json
{ "message": "Invalid items format" }
```

### Auth notes

- Protected route.

### Code anchors

- `server/routes/bookRoutes.js :: router.post('/check-stock', ...)`
- `server/controllers/bookController.js :: checkStock`
- `server/middleware/authMiddleware.js :: protect`

---

## POST `/api/books/`

Purpose: Create a book (admin).

### Request

- Method: `POST`
- Path: `/api/books/`
- Headers: `Authorization: Bearer <JWT>`
- Content type: `multipart/form-data`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `title` | string | Yes | `createBookSchema` |
| `author` | string | Yes | `createBookSchema` |
| `price` | number | Yes | `createBookSchema` |
| `stock` | integer | Yes | `createBookSchema` |
| `image` | file | Optional | `upload.single('image')` |

### Responses

Success example (`201`):

```json
{
  "status": "success",
  "code": 201,
  "data": { "id": "<BOOK_ID>", "title": "<TITLE>" }
}
```

Error example (`400`):

```json
{ "message": "Validation error: ..." }
```

### Auth notes

- Requires `protect` + `isAdmin`.

### Code anchors

- `server/routes/bookRoutes.js :: router.post('/', ...)`
- `server/controllers/bookController.js :: createBook`
- `server/middleware/authMiddleware.js :: protect`
- `server/middleware/authMiddleware.js :: isAdmin`
- `server/schemas/bookSchema.js :: createBookSchema`

---

## PUT `/api/books/:id`

Purpose: Update a book (admin).

### Request

- Method: `PUT`
- Path: `/api/books/:id`
- Headers: `Authorization: Bearer <JWT>`
- Content type: `multipart/form-data`

### Params

Path params:

| Name | Type | Required | Source |
|---|---|---|---|
| `id` | UUID | Yes | `idParamSchema` |

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| Book fields | mixed | At least one | `updateBookSchema` |
| `image` | file | Optional | `upload.single('image')` |

### Responses

Success example (`200`):

```json
{
  "status": "success",
  "code": 200,
  "data": { "id": "<BOOK_ID>", "title": "<TITLE>" }
}
```

Error example (`404`):

```json
{ "message": "Book not found" }
```

### Auth notes

- Requires `protect` + `isAdmin`.

### Code anchors

- `server/routes/bookRoutes.js :: router.put('/:id', ...)`
- `server/controllers/bookController.js :: updateBook`
- `server/middleware/authMiddleware.js :: protect`
- `server/middleware/authMiddleware.js :: isAdmin`
- `server/schemas/paramsSchemas.js :: idParamSchema`
- `server/schemas/bookSchema.js :: updateBookSchema`

---

## DELETE `/api/books/:id`

Purpose: Delete a book (admin).

### Request

- Method: `DELETE`
- Path: `/api/books/:id`
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
  "message": "Book deleted"
}
```

Error example (`404`):

```json
{ "message": "Book not found" }
```

### Auth notes

- Requires `protect` + `isAdmin`.

### Code anchors

- `server/routes/bookRoutes.js :: router.delete('/:id', ...)`
- `server/controllers/bookController.js :: deleteBook`
- `server/middleware/authMiddleware.js :: protect`
- `server/middleware/authMiddleware.js :: isAdmin`
- `server/schemas/paramsSchemas.js :: idParamSchema`

---

## GET `/api/search`

Purpose: Search books by title.

### Request

- Method: `GET`
- Path: `/api/search`
- Headers: optional `Authorization: Bearer <JWT>`

### Params

Query params:

| Name | Type | Required |
|---|---|---|
| `q` | string | Yes |
| `limit` | integer | Optional |

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
  "data": [{ "id": "<BOOK_ID>", "title": "<TITLE>" }]
}
```

Error example:

```json
{ "message": "Implementation-dependent" }
```

### Auth notes

- Uses optional auth middleware.

### Code anchors

- `server/routes/searchRoutes.js :: router.get('/search', ...)`
- `server/controllers/searchController.js :: searchBooks`
- `server/middleware/optionalAuth.js :: optionalAuth`

---

## GET `/api/favorites/`

Purpose: Get current user favorites.

### Request

- Method: `GET`
- Path: `/api/favorites/`
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
  "data": [{ "id": "<BOOK_ID>", "title": "<TITLE>" }]
}
```

Error example (`401`):

```json
{ "message": "Not authorized, no token" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/favoriteRoutes.js :: router.use(protect)`
- `server/routes/favoriteRoutes.js :: router.get('/', ...)`
- `server/controllers/favoriteController.js :: getFavorites`

---

## POST `/api/favorites/`

Purpose: Add a book to favorites.

### Request

- Method: `POST`
- Path: `/api/favorites/`
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

### Params

- None.

### Body schema

| Field | Type | Required | Source |
|---|---|---|---|
| `bookId` | UUID | Yes | `addFavoriteSchema` |

### Responses

Success example (`201`):

```json
{
  "status": "success",
  "code": 201,
  "message": "Added to favorites",
  "data": { "bookId": "<BOOK_ID>" }
}
```

Error example (`409`):

```json
{ "message": "Already in favorites" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/favoriteRoutes.js :: router.use(protect)`
- `server/routes/favoriteRoutes.js :: router.post('/', ...)`
- `server/controllers/favoriteController.js :: addFavorite`
- `server/schemas/favoriteSchema.js :: addFavoriteSchema`

---

## DELETE `/api/favorites/:bookId`

Purpose: Remove a book from favorites.

### Request

- Method: `DELETE`
- Path: `/api/favorites/:bookId`
- Headers: `Authorization: Bearer <JWT>`

### Params

Path params:

| Name | Type | Required | Source |
|---|---|---|---|
| `bookId` | UUID | Yes | `uuidParamSchema` |

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
  "message": "Removed from favorites"
}
```

Error example (`404`):

```json
{ "message": "Not in favorites" }
```

### Auth notes

- Protected by router-level `router.use(protect)`.

### Code anchors

- `server/routes/favoriteRoutes.js :: router.use(protect)`
- `server/routes/favoriteRoutes.js :: router.delete('/:bookId', ...)`
- `server/controllers/favoriteController.js :: removeFavorite`
- `server/schemas/paramsSchemas.js :: uuidParamSchema`

---

## PowerShell example

```powershell
Invoke-RestMethod -Method Get -Uri "<BASE_URL>/api/search?q=book&limit=5"
```
