# Local Development Guide

This guide covers how to get the full Kanbin development stack running on your machine.

## Prerequisites

### Required tools

| Tool | Version | Purpose | Install |
|---|---|---|---|
| [Go](https://go.dev/dl/) | 1.22+ | Backend & CLI language runtime | https://go.dev/dl/ |
| [Node.js](https://nodejs.org/) | 20+ | Frontend runtime | https://nodejs.org/ |
| [npm](https://www.npmjs.com/) | 10+ | Frontend package manager (bundled with Node.js) | Comes with Node.js |
| [Docker](https://www.docker.com/products/docker-desktop/) | 24+ | Local PostgreSQL database via Docker Compose | https://www.docker.com/products/docker-desktop/ |
| [Task](https://taskfile.dev/installation/) | 3+ | Task runner (`Taskfile.yml`) | https://taskfile.dev/installation/ |

### Optional but recommended

| Tool | Purpose | Install |
|---|---|---|
| [golangci-lint](https://golangci-lint.run/usage/install/) | Go linter for backend & CLI | https://golangci-lint.run/usage/install/ |
| [GoReleaser](https://goreleaser.com/install/) | CLI release automation | https://goreleaser.com/install/ |
| [Fly CLI](https://fly.io/docs/flyctl/install/) | Deploy backend/frontend to Fly.io | https://fly.io/docs/flyctl/install/ |

### Quick prerequisite check

Run the following to verify all required tools are installed:

```bash
bash scripts/check-tools.sh
```

## Setup

### 1. Install dependencies

```bash
task setup
```

This downloads Go module dependencies for the backend and CLI, and runs `npm install` for the frontend.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your local values. Defaults for a fresh Docker-based setup:

```env
DATABASE_URL=postgres://kanbin:kanbin@localhost:5432/kanbin_dev
PORT=8080
```

### 3. Start infrastructure

Docker Compose manages the local PostgreSQL database.

```bash
task up
```

This starts a PostgreSQL 16 container. Stop it at any time with:

```bash
task down
```

### 4. Start the development stack

```bash
task dev
```

This concurrently starts:
- **Backend** — `http://localhost:8080`
- **Frontend** — `http://localhost:5173` (Vite proxies `/api/*` to the backend)

Alternatively, start each component independently:

```bash
task dev-backend   # backend only
task dev-frontend  # frontend only
```

## Task Reference

### Top-level tasks

```bash
task setup          # Install all dependencies (backend, CLI, frontend)
task up             # Start Docker containers (PostgreSQL)
task down           # Stop Docker containers
task dev            # Start backend + frontend dev servers concurrently
task build          # Build all components to bin/
task test           # Run all tests
task lint           # Run linters across all components
task clean          # Remove build artifacts (bin/, frontend/dist/)
```

### Backend

```bash
task dev-backend    # Run backend dev server  (http://localhost:8080)
task build-backend  # Compile to bin/server.exe
task test-backend   # Run Go tests
task lint-backend   # Run golangci-lint
```

### CLI

```bash
task build-cli      # Compile to bin/kb.exe and bin/kanbin.exe
task install-cli    # Install kb to $GOPATH/bin for global use
task test-cli       # Run Go tests
task lint-cli       # Run golangci-lint
```

### Frontend

```bash
task dev-frontend    # Vite dev server (http://localhost:5173)
task build-frontend  # Production bundle to frontend/dist/
task lint-frontend   # ESLint
```

### Release & deploy

```bash
task release-cli    # Build and publish CLI via GoReleaser (requires a git tag)
task release-api    # Deploy backend to Fly.io
task release-app    # Deploy frontend to Fly.io
```

## Using the CLI Locally

Build the CLI and install it globally:

```bash
task install-cli
```

Or build it locally and run from `bin/`:

```bash
task build-cli
```

With the backend running (`task dev-backend`), try:

```bash
# Create a board
kb board create "My Test Board"

# View the board (use the key printed above)
kb board view <KEY>

# Add a task
kb task add "Fix the bug" --board <KEY>
```

If using `./bin/kb` instead of the global `kb` command, prefix commands with `./bin/`.

## Go Module Layout

| Module | Path | Description |
|---|---|---|
| `github.com/zeeshanejaz/kanbin/backend` | `backend/` | REST API server |
| `github.com/zeeshanejaz/kanbin/cli` | `cli/` | Command-line interface |

Each module has its own `go.mod` and can be built and tested independently.

## Database Migrations

Migrations are managed by [Goose](https://github.com/pressly/goose) and run automatically on backend startup. Migration files live in `backend/migrations/`. See `backend/migrations/README.md` for details.
