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
task setup
```

This installs Go module dependencies for the backend and CLI, and runs `npm install` for the frontend.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values (see below for defaults):

```env
DATABASE_URL=postgres://kanbin:kanbin@localhost:5432/kanbin_dev
PORT=8080
```

### 3. Start Infrastructure

We use Docker Compose to manage the local database.

```bash
task up
```

This starts a PostgreSQL 16 instance. To stop it, run `task down`.

### 4. Start the development stack

```bash
task dev
```

This starts:
- **Backend** — `http://localhost:8080`
- **Frontend** — `http://localhost:5173` (proxies `/api/*` to the backend)

## Common Commands

```bash
task build    # Build all components to bin/
task test     # Run all tests
task lint     # Run linters across all components
task clean    # Remove build artifacts
```

Each component's tasks are also available from the root `Taskfile.yml`:

```bash
# Backend only
task dev-backend   # Run backend dev server
task test-backend  # Run backend tests

# CLI only
task build-cli     # Build CLI binary to bin/kanbin.exe
task test-cli      # Run CLI tests

# Frontend only
task dev-frontend    # Vite dev server
task build-frontend  # Production build
task lint-frontend   # ESLint
```

## Testing the CLI Locally

Once you have the backend running (`task dev-backend`) and the CLI built (`task build-cli`), you can test the CLI commands right from your terminal.

```bash
# Create a test board
./bin/kb board create "Local Test Board"

# View the test board (copy the key from the output above)
./bin/kb board view <KEY>
```
