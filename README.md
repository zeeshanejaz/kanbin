# Kanbin

Lightweight, ephemeral Kanban boards for humans and AI agents. Create a board instantly — no sign-up required — share the key, and let it expire when the work is done.

## Components

| Component | Language | Description |
|---|---|---|
| `backend/` | Go | REST API server |
| `frontend/` | React + TypeScript | Web UI |
| `cli/` | Go | Command-line interface |

## Quickstart

### Prerequisites

- Go 1.22+
- Node 20+
- PostgreSQL (or Docker)
- [`golangci-lint`](https://golangci-lint.run/usage/install/)

### Setup

```bash
# 1. Install all dependencies
task setup

# 2. Configure environment
cp .env.example .env
# Edit .env with your database URL and other settings

# 3. Start the development stack
task dev
```

The frontend dev server starts on `http://localhost:5173` and proxies API requests to the backend on `http://localhost:8080`.

## Common Commands

| Command | Description |
|---|---|
| `task setup` | Install Go and npm dependencies |
| `task dev` | Start backend + frontend in dev mode |
| `task build` | Build all components to `bin/` |
| `task test` | Run all tests |
| `task lint` | Lint all components |
| `task clean` | Remove build artifacts |

## Documentation

- [Local Development Guide](docs/local-dev.md)
- [Architecture Overview](docs/architecture.md)
- [REST API Reference](docs/api.md)

## Project Specifications

See [`.specs/`](.specs/) for the project constitution, product specifications, and MVP delivery plan.
