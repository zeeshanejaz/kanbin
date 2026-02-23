# Security Hardening — Implementation Plan

**KB Board**: `95b6a48a`
**Spec**: [specification.md](specification.md)

---

## Overview
Apply all security hardening recommendations from the February 2026 security review. No product behaviour changes — pure defensive hardening.

## Dependencies
- `golang.org/x/time` (rate limiter) — add to `backend/go.mod`

## File Structure

### New Files
- `backend/internal/api/middleware.go` — security headers + rate limiter middleware
- `backend/internal/api/handlers_test.go` — integration tests

### Modified Files
- `backend/internal/api/router.go` — key entropy, CORS, middleware registration, remove search route
- `backend/internal/api/handlers.go` — board-ownership check, expired-board check, input validation, remove search handler
- `backend/internal/config/config.go` — ALLOWED_ORIGINS env var, remove hardcoded DATABASE_URL fallback
- `backend/internal/domain/board.go` — hide ID from JSON
- `backend/internal/domain/task.go` — hide BoardID from JSON
- `backend/internal/repository/postgres/board.go` — add GetByID method (needed for ownership check)
- `docker-compose.yml` — stronger DB password
- `frontend/src/api/client.ts` — pass X-Board-Key header on task mutations
- `cli/internal/client/client.go` — pass board key header on task mutations
- `cli/cmd/kanbin/task.go` — add --board-key flag, remove search command
- `cli/cmd/kanbin/board.go` — remove search command

---

## Implementation Phases

### Phase 1 — Quick Wins
- [ ] 1.1 Increase board key entropy (KB: `a98c953c`) — `router.go`
- [ ] 1.2 Add security headers middleware (KB: `d9aaab3a`) — new `middleware.go`
- [ ] 1.3 Fix CORS to env-driven allowlist (KB: `cda49b96`) — `router.go`, `config.go`
- [ ] 1.4 Remove hardcoded DB credentials (KB: `5c8c9acb`) — `config.go`, `docker-compose.yml`

### Phase 2 — Authorization and Rate Limiting
- [ ] 2.1 Add rate limiting middleware (KB: `51ea920b`) — `middleware.go`, `go.mod`
- [ ] 2.2 Add board-ownership check to task mutations (KB: `fa98513d`) — `handlers.go`, `domain/board.go`, `repository/postgres/board.go`
- [ ] 2.3 Update frontend to pass X-Board-Key (KB: `398471cb`) — `frontend/src/api/client.ts`
- [ ] 2.4 Update CLI task commands to pass board key (KB: `6a36b90c`) — `cli/...`

### Phase 3 — Input Validation, Lifecycle, Cleanup
- [ ] 3.1 Add input validation to request handlers (KB: `36ca3eb9`) — `handlers.go`
- [ ] 3.2 Add expired board check on task mutations (KB: `db390d87`) — `handlers.go`
- [ ] 3.3 Remove board search endpoint (KB: `0f10a03e`) — `router.go`, `handlers.go`, CLI
- [ ] 3.4 Hide internal UUIDs from JSON responses (KB: `86ead026`) — `domain/board.go`, `domain/task.go`
- [ ] 3.5 Write unit and integration tests (KB: `aa4901c6`) — `handlers_test.go`

---

## Success Criteria
- All existing functionality works unchanged (board CRUD, task CRUD, drag-drop)
- `GET /api/boards?q=` returns 404
- `PUT/DELETE /tasks/{id}` without correct board key returns 403
- `POST /boards` with title > 255 chars returns 400
- New board keys are 32 hex chars
- Security headers present on all responses
- Backend starts with fatal error if DATABASE_URL is unset
