# Local Development Guide

This guide covers how to get the full Kanbin development stack running on your machine.

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Go | 1.22+ | https://go.dev/dl/ |
| Node.js | 20+ | https://nodejs.org/ |
| PostgreSQL | 15+ | https://www.postgresql.org/download/ or via Docker |
| `golangci-lint` | latest | https://golangci-lint.run/usage/install/ |

### Quick prerequisite check

```bash
bash scripts/check-tools.sh
```

## Setup

### 1. Install dependencies

```bash
make setup
```

This installs Go module dependencies for the backend and CLI, and runs `npm install` for the frontend.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DATABASE_URL=postgres://user:password@localhost:5432/kanbin
PORT=8080
```

**Using Docker for PostgreSQL:**

```bash
docker run -d \
  --name kanbin-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=kanbin \
  -p 5432:5432 \
  postgres:15-alpine
```

### 3. Start the development stack

```bash
make dev
```

This starts:
- **Backend** — `http://localhost:8080`
- **Frontend** — `http://localhost:5173` (proxies `/api/*` to the backend)

## Common Commands

```bash
make build    # Build all components to bin/
make test     # Run all tests
make lint     # Run linters across all components
make clean    # Remove build artifacts
```

## Working on a Single Component

Each component has its own `Makefile`:

```bash
# Backend only
cd backend && make run   # Run backend dev server
cd backend && make test  # Run backend tests

# CLI only
cd cli && make build     # Build CLI binary to ../bin/kanbin
cd cli && make run       # Run CLI

# Frontend only
cd frontend && npm run dev    # Vite dev server
cd frontend && npm run build  # Production build
cd frontend && npm run lint   # ESLint
```
