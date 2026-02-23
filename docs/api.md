# Kanbin REST API Reference

Base URL: `https://kanbin.app/api` (or `http://localhost:8080/api` for local development)

## Authentication

Kanbin uses a **key-based access model** with no authentication required. Each board is identified by a unique **32-character hex key** (`a1b2c3d4e5f67890abcdef1234567890`) that grants full access to that board and its tasks.

Ownership is proved by including the board key in the URL path for task mutation endpoints (`PUT /boards/:key/tasks/:id`, `DELETE /boards/:key/tasks/:id`). If the key in the path does not match the task's board, the server returns `403 Forbidden`.

## Response Format

All responses return JSON with appropriate HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid request format
- `403 Forbidden` - Board key in path does not match the task's board
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded (see [Rate Limits](#rate-limits))
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "error": "Description of the error"
}
```

## Boards

### Create a Board

Create a new ephemeral board with a unique key.

**Endpoint:** `POST /boards`

**Request Body:**

```json
{
  "name": "My Project Board"
}
```

**Response:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "a1b2c3d4e5f67890abcdef1234567890",
  "name": "My Project Board",
  "created_at": "2026-02-22T09:30:00Z",
  "updated_at": "2026-02-22T09:30:00Z"
}
```

**Note:** The `key` is a 32-character hex string and the board's access credential. Store it securely — it cannot be recovered.

---

### Get a Board

Retrieve board details and all associated tasks.

**Endpoint:** `GET /boards/:key`

**Path Parameters:**

- `key` - Board key (UUID)

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "a1b2c3d4e5f67890abcdef1234567890",
  "name": "My Project Board",
  "created_at": "2026-02-22T09:30:00Z",
  "updated_at": "2026-02-22T09:30:00Z",
  "tasks": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "board_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Setup CI pipeline",
      "description": "Configure GitHub Actions",
      "status": "TODO",
      "position": 1000,
      "created_at": "2026-02-22T09:31:00Z",
      "updated_at": "2026-02-22T09:31:00Z"
    }
  ]
}
```

---

### Update a Board

Update the board name.

**Endpoint:** `PATCH /boards/:key`

**Path Parameters:**

- `key` - Board key (UUID)

**Request Body:**

```json
{
  "name": "Renamed Project Board"
}
```

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "a1b2c3d4e5f67890abcdef1234567890",
  "name": "Renamed Project Board",
  "created_at": "2026-02-22T09:30:00Z",
  "updated_at": "2026-02-22T10:00:00Z"
}
```

---

### Delete a Board

Delete a board and all its tasks permanently.

**Endpoint:** `DELETE /boards/:key`

**Path Parameters:**

- `key` - Board key (UUID)

**Response:** `204 No Content`

---

## Tasks

### Create a Task

Add a new task to a board.

**Endpoint:** `POST /boards/:key/tasks`

**Path Parameters:**

- `key` - Board key (UUID)

**Request Body:**

```json
{
  "title": "Implement authentication",
  "description": "Add JWT-based auth",
  "status": "TODO"
}
```

**Field Details:**

- `title` (required) - Task title
- `description` (optional) - Detailed task description
- `status` (optional) - One of: `TODO`, `IN_PROGRESS`, `DONE`. Defaults to `TODO`

**Response:** `201 Created`

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "board_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Implement authentication",
  "description": "Add JWT-based auth",
  "status": "TODO",
  "position": 1000,
  "created_at": "2026-02-22T09:35:00Z",
  "updated_at": "2026-02-22T09:35:00Z"
}
```

---

### Update a Task

Update task details, status, or position.

**Endpoint:** `PUT /boards/:key/tasks/:task_id`

**Path Parameters:**

- `key` - Board key (32-char hex) — acts as proof of ownership
- `task_id` - Task ID (UUID)

**Request Body:**

```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "position": 2000
}
```

**Notes:**

- All fields are optional
- `position` is used for ordering tasks within a status column (drag-and-drop)
- Status must be one of: `TODO`, `IN_PROGRESS`, `DONE`
- Returns `403 Forbidden` if the key in the path does not match the task's board

**Response:** `200 OK`

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "board_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated task title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "position": 2000,
  "created_at": "2026-02-22T09:35:00Z",
  "updated_at": "2026-02-22T10:15:00Z"
}
```

---

### Delete a Task

Permanently delete a task.

**Endpoint:** `DELETE /boards/:key/tasks/:task_id`

**Path Parameters:**

- `key` - Board key (32-char hex) — acts as proof of ownership
- `task_id` - Task ID (UUID)

**Notes:**

- Returns `403 Forbidden` if the key in the path does not match the task's board

**Response:** `204 No Content`

---

## Data Models

### Board

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Internal board identifier |
| `key` | String (32-char hex) | Board access key |
| `name` | String | Board name |
| `created_at` | ISO 8601 | Creation timestamp |
| `updated_at` | ISO 8601 | Last modification timestamp |
| `tasks` | Array | Associated tasks (only in GET board) |

---

### Task

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Task identifier |
| `board_id` | UUID | Parent board ID |
| `title` | String | Task title |
| `description` | String | Task description (optional) |
| `status` | Enum | `TODO` · `IN_PROGRESS` · `DONE` |
| `position` | Integer | Sort order within status column |
| `created_at` | ISO 8601 | Creation timestamp |
| `updated_at` | ISO 8601 | Last modification timestamp |

---

### Task Status Values

| Status | Description |
|---|---|
| `TODO` | Not started — default for new tasks |
| `IN_PROGRESS` | Work in progress |
| `DONE` | Completed |

---

## Examples

### cURL Examples

**Create a board:**

```bash
curl -X POST https://kanbin.app/api/boards \
  -H "Content-Type: application/json" \
  -d '{"name": "Sprint Planning"}'
```

**Get a board:**

```bash
curl https://kanbin.app/api/boards/a1b2c3d4e5f67890abcdef1234567890
```

**Add a task:**

```bash
curl -X POST https://kanbin.app/api/boards/a1b2c3d4e5f67890abcdef1234567890/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Setup CI", "status": "TODO"}'
```

**Update task status:**

```bash
curl -X PUT https://kanbin.app/api/boards/a1b2c3d4e5f67890abcdef1234567890/tasks/660e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```

---

## Rate Limits

The API enforces per-IP rate limits using a token-bucket algorithm:

| Bucket | Limit | Applies to |
|---|---|---|
| Global | 200 requests / minute | All endpoints |
| Board GET | 60 requests / minute | `GET /boards/:key` |
| Board POST | 10 requests / minute | `POST /boards` |

When a limit is exceeded the server returns `429 Too Many Requests` with a `Retry-After: 60` header.

---

## CORS

The API supports CORS to allow browser-based clients. Allowed origins are controlled by the `ALLOWED_ORIGINS` environment variable (comma-separated list). The default development value is `http://localhost:5173,http://localhost:3000`. In production, set this explicitly to your frontend domain(s).

---

## Security Headers

Every response includes the following defensive headers:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `default-src 'none'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` (production only) |

---

## Caching & ETags

The API supports HTTP ETag-based caching for board and task endpoints. Clients can use `If-None-Match` headers to minimize bandwidth.

---

## Support

For issues, features requests, or questions, visit the [GitHub repository](https://github.com/zeeshanejaz/kanbin).
