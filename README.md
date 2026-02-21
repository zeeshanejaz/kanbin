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

## CLI Usage

Kanbin includes a command-line interface available as both `kanbin` and the shorthand `kb`. Once you run `task build`, the binaries are located in the `bin/` directory.

```bash
# General help
./bin/kb --help

# Create a new key-based anonymous board
./bin/kb board create "My CLI Board"

# View a board and its tasks
./bin/kb board view <BOARD_KEY>

# Add a new task to a board
./bin/kb task add "Implement auth" --board <BOARD_KEY>
```

## Documentation

- [Local Development Guide](docs/local-dev.md)
- [Architecture Overview](docs/architecture.md)
- [REST API Reference](docs/api.md)

## Project Specifications

See [`.specs/`](.specs/) for the project constitution, product specifications, and MVP delivery plan.
