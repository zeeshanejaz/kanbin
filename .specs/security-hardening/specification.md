# Security Hardening Specification

## Purpose and Goals

Address all critical, high, and medium security findings identified in the February 2026 security review. The goal is to ensure that only a holder of a valid board key can read, create, modify, or delete data on that board and its tasks — while keeping the zero-signup, key-based model intact.

No changes to the external user model or product behaviour are intended. All changes are defensive hardening of the existing implementation.

---

## Key Requirements and Behaviours

### 1. Board Key Entropy (CRITICAL)
- Board keys must use **16 random bytes** (32 hex characters) instead of the current 4 bytes.
- This raises the brute-force search space from ~4 billion to ~340 undecillion combinations.

### 2. Board Search Removal/Restriction (CRITICAL)
- `GET /api/boards?q=` currently returns full board objects including board keys, enabling full enumeration.
- **Remove the public search endpoint entirely** (it is not referenced in the frontend and only used internally in the CLI).
- The CLI's `kb board search` command should be removed or replaced with a direct fetch by key.

### 3. Task Mutation Board-Ownership Verification (CRITICAL)
- `PUT /tasks/{id}` and `DELETE /tasks/{id}` currently accept bare task UUIDs with no board-level authorization check.
- Both handlers must verify that the task belongs to a board whose key is provided (via `X-Board-Key` request header or query param).
- If the key is absent or does not match the task's board, return `403 Forbidden`.

### 4. Rate Limiting (HIGH)
- Add a per-IP rate limiter applied before routing:
  - **Global**: 200 requests/minute per IP
  - **Board GET**: 60 requests/minute per IP
  - **Board POST (create)**: 10 boards/minute per IP
- Use `golang.org/x/time/rate` with an in-memory store (IP → limiter).
- Return `429 Too Many Requests` with a `Retry-After` header when exceeded.

### 5. Security Response Headers (HIGH)
- Add a middleware that sets the following headers on all responses:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy: default-src 'none'` (API — no content served)
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains` (production only)

### 6. CORS Restriction (HIGH)
- Replace the wildcard `https://*.fly.dev` allowed origin with explicit domain entries.
- The allowed origins list should be driven by an environment variable `ALLOWED_ORIGINS` (comma-separated).
- Default for local dev: `http://localhost:5173,http://localhost:3000`.

### 7. Input Validation (MEDIUM)
- Validate all inbound request bodies:
  - `title`: required, max 255 characters
  - `description`: optional, max 10,000 characters
  - `status`: must be one of `TODO`, `IN_PROGRESS`, `DONE`
  - Board key path parameter: must match `[0-9a-f]{8,64}` (hex string between 8 and 64 chars)
  - Task ID path parameter: must be a valid UUID (already partially done)
- Escape `%` and `_` wildcard characters in the board search LIKE query (if search is retained).
- Return `400 Bad Request` with a descriptive JSON error for validation failures.

### 8. Expired Board Check on Task Mutations (MEDIUM)
- `POST /boards/{key}/tasks`, `PUT /tasks/{id}`, and `DELETE /tasks/{id}` must check that the parent board has not expired before mutating data.
- For task mutations, look up the board via the task's `board_id`, then check `expires_at`.
- Return `410 Gone` if the board is expired.

### 9. Hardcoded Credential Removal (MEDIUM)
- Remove the default fallback `postgres://kanbin:kanbin@localhost:5432/kanbin_dev` from `config.go`.
- If `DATABASE_URL` is not set, the server must fail fast with a clear fatal error message.
- Update `docker-compose.yml` to use a stronger default password (or reference a `.env` file).
- Document the required environment variables in `README.md`.

### 10. Internal UUID Exposure Reduction (LOW)
- The internal `board.ID` (UUID) is returned in `GET /boards/{key}` responses today.
- Remove `board.ID` and `task.BoardID` from JSON serialization (`json:"-"`) since external callers have no use for internal UUIDs — they already have the board key and task UUIDs.
- This reduces the information available to an attacker for crafting targeted requests.

---

## User Interactions and Workflows

- No visible change to the UI. Board creation, viewing, and task management work identically.
- Task delete/update API calls from the frontend must include the board key in the `X-Board-Key` header. The frontend `api/client.ts` must be updated to pass this header.
- The CLI task commands must pass the board key when updating or deleting tasks.
- Rate limiting is transparent to human users under normal usage. High-frequency automated clients receive `429` responses.

---

## Technical Requirements and Dependencies

### Backend
- `golang.org/x/time` for the token-bucket rate limiter (already in the Go stdlib supplement; add to `go.mod`)
- No new external dependencies beyond that
- All new middleware must be registered in `router.go` in the correct order (security headers → rate limiter → CORS → existing middleware)

### Frontend
- `api/client.ts` updated to store the board key in memory when navigating to a board, and to pass `X-Board-Key` on `updateTask` and `deleteTask` calls

### CLI
- `cli/internal/client/client.go` updated so task update/delete calls send the board key header
- CLI commands for tasks need to accept/store board key context

---

## Constraints and Considerations

- **Backwards compatibility**: The board key length change is backwards compatible for new boards; existing short (8-char) boards will continue to work since the backend looks up by key value, not length.
- **No authentication system**: This spec explicitly does not add user accounts, sessions, or tokens. The board key remains the sole credential.
- **Rate limiter is in-memory**: A multi-instance deployment (e.g., multiple fly.io machines) will have per-instance limits, not global. This is acceptable for MVP; a Redis-backed limiter is out of scope.
- **HSTS header**: Only emit in production. Add a `PRODUCTION` env var boolean check.

---

## Testing and Validation Criteria

### Unit Tests
- `generateBoardKey()` returns a 32-character lowercase hex string
- Rate limiter middleware allows requests below threshold and returns 429 above it
- Security headers middleware sets all required headers on every response
- Input validation rejects blank titles, titles > 255 chars, invalid status values
- Board-ownership check returns 403 when key doesn't match task's board
- Expired board check returns 410 on task mutations when board is past `expires_at`

### Integration Tests
- `PUT /tasks/{id}` without `X-Board-Key` → `403`
- `PUT /tasks/{id}` with wrong board key → `403`
- `PUT /tasks/{id}` with correct board key → `200`
- `DELETE /tasks/{id}` without `X-Board-Key` → `403`
- `POST /boards/{key}/tasks` on expired board → `410`
- `POST /boards` title > 255 chars → `400`
- `GET /api/boards?q=...` → `404` (endpoint removed)

### Edge Cases
- Task belonging to board A cannot be mutated using board B's key
- Task update on a non-existent task ID still returns 404 (not 403) to avoid leaking existence info — decide: 404 vs 403 for missing task with wrong key (spec: return 403 to avoid confirming task existence)
- Rate limiter should not block health check endpoint

---

## Implementation Phases and Tasks

### Phase 1 — Quick Wins (no interface changes, self-contained)
| Task | File(s) | Notes |
|---|---|---|
| 1.1 Increase board key entropy | `backend/internal/api/router.go` | Change `rand.Read(b)` from 4 to 16 bytes |
| 1.2 Add security headers middleware | `backend/internal/api/middleware.go` (new) | All 5 headers listed above |
| 1.3 Fix CORS to env-driven allowlist | `backend/internal/api/router.go`, `backend/internal/config/config.go` | New `ALLOWED_ORIGINS` env var |
| 1.4 Remove hardcoded DB credentials | `backend/internal/config/config.go`, `docker-compose.yml` | Fatal error if `DATABASE_URL` unset |

### Phase 2 — Authorization and Rate Limiting
| Task | File(s) | Notes |
|---|---|---|
| 2.1 Add rate limiting middleware | `backend/internal/api/middleware.go`, `go.mod` | `golang.org/x/time/rate` |
| 2.2 Add board-ownership check to task mutations | `backend/internal/api/handlers.go` | Both `PUT /tasks/{id}` and `DELETE /tasks/{id}` |
| 2.3 Update frontend to pass X-Board-Key | `frontend/src/api/client.ts` | Store key from URL context |
| 2.4 Update CLI task commands to pass board key | `cli/internal/client/client.go`, `cli/cmd/kanbin/task.go` | Accept `--board-key` flag or derive from config |

### Phase 3 — Input Validation, Lifecycle, and Cleanup
| Task | File(s) | Notes |
|---|---|---|
| 3.1 Add input validation to all request handlers | `backend/internal/api/handlers.go` | Title len, description len, status enum |
| 3.2 Add expired board check on task mutations | `backend/internal/api/handlers.go` | Look up board from task's board_id |
| 3.3 Remove/restrict board search endpoint | `backend/internal/api/router.go`, `backend/internal/api/handlers.go` | Remove route; remove CLI search command |
| 3.4 Hide internal UUIDs from JSON responses | `backend/internal/domain/board.go`, `backend/internal/domain/task.go` | Add `json:"-"` to `ID` and `BoardID` fields |
| 3.5 Write unit and integration tests | `backend/internal/api/*_test.go` | Cover all new behaviours listed above |
