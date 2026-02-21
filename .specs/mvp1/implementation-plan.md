# MVP1 Implementation Plan — Anonymous Boards

This document detailed the technical implementation steps for the MVP1 milestone.

## Infrastructure

### Docker Compose
We will use Docker Compose for local development to ensure a consistent environment.

- **Postgres**: Version 16 (Alpine-based).
- **Environment**: Default to `user: kanbin`, `password: kanbin`, `db: kanbin_dev`.

### [NEW] `docker-compose.yml`
```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      - POSTGRES_USER=kanbin
      - POSTGRES_PASSWORD=kanbin
      - POSTGRES_DB=kanbin_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Proposed Changes

### Database Setup
#### [NEW] `backend/migrations/001_init_schema.sql`
- `boards` table with `id`, `key` (unique index), `title`, `created_at`, `expires_at`.
- `tasks` table with `id`, `board_id` (FK), `title`, `description`, `status`, `position`, `created_at`, `updated_at`.

### Documentation
#### [MODIFY] `docs/local-dev.md`
- Add "Docker Setup" section.
- Document how to start the database using `task up`.

#### [MODIFY] `Taskfile.yml`
- Add `up` and `down` tasks for Docker Compose.

---

### Backend (Go)
#### [MODIFY] `backend/internal/config/config.go`
- Add database connection string parsing.

#### [NEW] `backend/internal/domain/board.go` & `task.go`
- Domain models and repository interfaces.

#### [NEW] `backend/internal/repository/postgres/`
- SQL implementations for boards and tasks.

#### [NEW] `backend/internal/api/router.go`
- Chi router setup with CORS and logging.

---

### Frontend (React)
- Initialize routing (Home, Board).
- Create basic styling with Vanilla CSS.
- Basic API client.

---

### CLI (Go + Cobra)
- Base command structure.
- Board and Task subcommands.
- **Dual Binary Build**: The build process will produce both `kanbin` and `kb` binaries for convenience.

## Verification Plan

### Stage 1: Infrastructure
1. Run `task up`.
2. Verify Postgres is accessible at `localhost:5432` with `psql` or a tool.

### Stage 2: Database Schema
1. Run migrations (once implemented).
2. Verify tables exist.
