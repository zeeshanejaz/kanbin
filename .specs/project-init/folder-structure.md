# Kanbin — Project Folder Structure

> This document defines the canonical folder and file layout for the kanbin repository. It is the reference for what gets created during project initialisation (MVP0 / setup phase). Implementation detail lives in the implementation plan.

---

## Top-Level Layout

```
kanbin/
├── .specs/                  # Project specifications (non-code)
│   └── project-init/        # This folder
├── backend/                 # Go REST API server
├── frontend/                # React + TypeScript web app
├── cli/                     # Go CLI binary
├── docs/                    # Developer documentation
├── scripts/                 # Repo-wide helper scripts
├── .github/                 # GitHub Actions workflows (future)
├── .gitignore
├── Makefile                 # Root build/dev orchestration
└── README.md
```

---

## `backend/` — Go REST API

Standard Go layout following `golang-standards/project-layout`.

```
backend/
├── cmd/
│   └── server/
│       └── main.go          # Entrypoint: wires deps, starts HTTP server
├── internal/
│   ├── config/              # Config loading (env vars, defaults)
│   ├── domain/              # Core types: Board, Task, enums
│   ├── handler/             # HTTP handlers (one file per resource group)
│   ├── middleware/          # HTTP middleware (logging, CORS, auth)
│   ├── repository/          # Data access layer (DB queries)
│   └── service/             # Business logic (board rules, expiry, limits)
├── migrations/              # SQL migration files (sequential, numbered)
├── go.mod
├── go.sum
└── Makefile                 # backend-specific targets (build, test, run)
```

### Key Decisions

- **Single `go.mod`** at `backend/` — the CLI will be a separate module to allow independent distribution.
- **`internal/`** enforces encapsulation; nothing in `backend/internal` can be imported by the CLI.
- **`domain/`** holds plain Go structs with no external dependencies — the canonical definition of all entities.
- **`handler/`** files are named after the resource: `board_handler.go`, `task_handler.go`.
- **`repository/`** depends only on `domain/`; `service/` depends on `repository/` interfaces.
- **`migrations/`** uses sequential numbered files: `0001_create_boards.sql`, `0002_create_tasks.sql`, etc.

---

## `frontend/` — React + TypeScript

Scaffolded with Vite using the `react-ts` template.

```
frontend/
├── public/                  # Static assets served as-is
├── src/
│   ├── api/                 # Typed API client (one file per resource)
│   ├── components/          # Shared reusable UI components
│   ├── pages/               # Top-level page components (route-level)
│   ├── hooks/               # Custom React hooks
│   ├── types/               # Shared TypeScript types and interfaces
│   ├── utils/               # Pure utility functions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── package.json
```

### Key Decisions

- **`src/api/`** is the only place raw HTTP calls exist. Components never call `fetch` directly.
- **`src/types/`** mirrors the `domain/` types from the backend — kept manually in sync for MVP1, code generation considered later.
- **`src/pages/`** components are route-level containers; `src/components/` holds sub-components.
- **No CSS framework** — plain CSS per constitution (no Tailwind, no CSS-in-JS library for MVP1).
- Strict TypeScript is enforced via `"strict": true` in `tsconfig.json`.

---

## `cli/` — Go CLI Binary

A separate Go module for independent binary distribution.

```
cli/
├── cmd/
│   └── kanbin/
│       └── main.go          # Entrypoint
├── internal/
│   ├── api/                 # Typed HTTP client for the kanbin REST API
│   ├── config/              # CLI config (auth token, server URL)
│   └── output/              # Formatters: table, JSON, plain text
├── go.mod
├── go.sum
└── Makefile
```

### Key Decisions

- **Separate `go.mod`** so the CLI can be distributed as a standalone binary with its own versioning and release cycle.
- **`internal/api/`** is a thin client wrapping the REST API — mirrors the frontend's `src/api/` in spirit.
- **`internal/config/`** manages a local config file (e.g., `~/.config/kanbin/config.toml`) for saved auth tokens.

---

## `docs/` — Developer Documentation

```
docs/
├── api.md                   # REST API reference (hand-authored for MVP1)
├── local-dev.md             # How to run the full stack locally
└── architecture.md          # High-level system diagram and component overview
```

---

## `scripts/` — Repo-Wide Scripts

```
scripts/
└── check-tools.sh           # Verifies required tools are installed (go, node, npm)
```

---

## Root Files

| File | Purpose |
|---|---|
| `Makefile` | Top-level orchestration: `make dev`, `make build`, `make test`, `make lint` |
| `README.md` | Project overview, quickstart guide |
| `.gitignore` | Ignores for Go binaries, `node_modules`, `.env` files, build output |

### Root `Makefile` Targets

| Target | Description |
|---|---|
| `make setup` | Install all dependencies (Go mod download + npm install) |
| `make dev` | Start backend dev server + frontend Vite dev server concurrently |
| `make build` | Build all components (backend binary, frontend bundle, CLI binary) |
| `make test` | Run all tests (backend Go tests + frontend vitest) |
| `make lint` | Run `golangci-lint` (backend + CLI) and `eslint` (frontend) |
| `make clean` | Remove all build artifacts |

---

## Environment Configuration

- Environment variables are the sole method for runtime configuration (no committed `.env` files).
- A `.env.example` file at the root documents all required variables with safe placeholder values.
- Backend reads env vars directly via `os.Getenv` wrapped in a `config` package.

```
.env.example  (root)
DATABASE_URL=postgres://user:password@localhost:5432/kanbin
PORT=8080
```
