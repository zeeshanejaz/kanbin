# Kanbin — Project Initialisation Implementation Plan

> Goal: stand up the repository skeleton so that all three components (backend, frontend, CLI) can be developed from a clean, consistent baseline. No application logic is written in this phase — only tooling, scaffolding, and structure.

---

## Proposed Changes

### Root

#### [NEW] `.gitignore`
Standard combined gitignore covering Go binaries, `node_modules`, build output (`dist/`, `bin/`), `.env` files, and OS noise (`.DS_Store`, `Thumbs.db`).

#### [NEW] `README.md`
Project overview with a brief description, component list, and quickstart. Links to `docs/local-dev.md` for full setup instructions.

#### [NEW] `Makefile`
Root orchestration Makefile with targets:

| Target | Action |
|---|---|
| `setup` | `go mod download` in `backend/` + `cli/`, `npm install` in `frontend/` |
| `dev` | Runs `backend` dev server and `frontend` Vite dev server concurrently via background processes |
| `build` | Builds backend binary → `bin/server`, CLI binary → `bin/kanbin`, frontend bundle → `frontend/dist/` |
| `test` | `go test ./...` in `backend/` and `cli/`, `npm run test` in `frontend/` |
| `lint` | `golangci-lint run` in `backend/` + `cli/`, `npm run lint` in `frontend/` |
| `clean` | Removes `bin/`, `frontend/dist/` |

#### [NEW] `.env.example`
Documents all required environment variables with placeholder values:
```
DATABASE_URL=postgres://user:password@localhost:5432/kanbin
PORT=8080
```

---

### `backend/` — Go Module

#### [NEW] `backend/go.mod`
```
module github.com/zeeshanejaz/kanbin/backend

go 1.22
```
> **Note:** Module path TBD — will use `github.com/<org>/kanbin/backend` convention. No external dependencies added yet (stdlib only for the skeleton).

#### [NEW] `backend/cmd/server/main.go`
Minimal entrypoint — just prints a startup message and exits. Real HTTP server wiring happens in the next implementation phase.

#### [NEW] `backend/internal/config/config.go`
Exports a `Config` struct loaded from environment variables with sensible defaults. Fields: `Port`, `DatabaseURL`.

#### [NEW] `backend/internal/domain/board.go`
Empty file with package declaration and a placeholder comment. Domain types to be defined in MVP1 backend phase.

#### [NEW] `backend/internal/domain/task.go`
Same as above for `Task`.

#### [NEW] `backend/migrations/` (empty directory)
Placeholder. First migration (`0001_create_boards.sql`) will be created in the backend MVP1 phase.

#### [NEW] `backend/Makefile`
Targets: `build`, `run`, `test`, `lint`.

---

### `frontend/` — Vite + React + TypeScript

#### [NEW] Scaffold via Vite
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
```

This creates the standard Vite scaffold. The following files are then adjusted:

#### [MODIFY] `frontend/src/App.tsx`
Replace default content with a bare placeholder component:
```tsx
export function App() {
  return <div>Kanbin</div>
}
```

#### [MODIFY] `frontend/src/index.css`
Wipe the Vite default styles; start with a CSS reset and basic body font.

#### [MODIFY] `frontend/tsconfig.json`
Ensure `"strict": true` is set (Vite's default includes this — verify only).

#### [NEW] `frontend/src/api/` (empty directory with `.gitkeep`)
Placeholder for the typed API client layer. First files added in MVP1 frontend phase.

#### [NEW] `frontend/src/types/` (empty directory with `.gitkeep`)
Placeholder for shared TypeScript types.

#### [MODIFY] `frontend/vite.config.ts`
Add a dev server proxy rule so `fetch('/api/...')` forwards to the backend (default `http://localhost:8080`). This avoids CORS issues during local development.

```ts
server: {
  proxy: {
    '/api': 'http://localhost:8080',
  },
},
```

---

### `cli/` — Go Module

#### [NEW] `cli/go.mod`
```
module github.com/zeeshanejaz/kanbin/cli

go 1.22
```

#### [NEW] `cli/cmd/kanbin/main.go`
Minimal entrypoint that prints `kanbin CLI vdev` and exits. Real command wiring happens in MVP1 CLI phase.

#### [NEW] `cli/internal/api/` (empty package placeholder)
Placeholder for the typed REST API client.

#### [NEW] `cli/internal/config/config.go`
Placeholder `Config` struct. Will manage `~/.config/kanbin/config.toml` in the CLI MVP1 phase.

#### [NEW] `cli/Makefile`
Targets: `build`, `run`, `test`.

---

### `docs/`

#### [NEW] `docs/local-dev.md`
Step-by-step instructions for getting the full stack running locally:
1. Prerequisites (Go 1.22+, Node 20+, PostgreSQL or Docker)
2. Clone the repo
3. `make setup`
4. Copy `.env.example` to `.env` and fill in values
5. `make dev`

#### [NEW] `docs/architecture.md`
Simple text diagram showing Backend → DB, Frontend → Backend, CLI → Backend relationships.

---

### `scripts/`

#### [NEW] `scripts/check-tools.sh`
Bash script that checks for required tools (`go`, `node`, `npm`, `golangci-lint`) and prints a clear error if any are missing. Called optionally from `make setup`.

---

## Verification Plan

> This is a setup/scaffolding phase — there are no application tests yet. Verification is structural and build-smoke-check only.

### Structural Checks (Manual)

1. **Directory tree matches spec**
   - Run `tree kanbin/` (or `Get-ChildItem -Recurse` on Windows) and confirm all folders and placeholder files exist as defined in `folder-structure.md`.

2. **`make setup` succeeds**
   ```bash
   make setup
   ```
   Expected: Go modules download without errors; `npm install` completes in `frontend/`.

3. **Backend compiles**
   ```bash
   cd backend && go build ./...
   ```
   Expected: exits 0, binary produced at `bin/server` (or local).

4. **CLI compiles**
   ```bash
   cd cli && go build ./...
   ```
   Expected: exits 0, binary produced.

5. **Frontend dev server starts**
   ```bash
   cd frontend && npm run dev
   ```
   Expected: Vite starts on `localhost:5173`, browser shows `Kanbin` text.

6. **`make build` succeeds from root**
   ```bash
   make build
   ```
   Expected: all three components build without errors.

7. **`make lint` succeeds**
   ```bash
   make lint
   ```
   Expected: `golangci-lint` exits 0 on the skeleton Go code; ESLint exits 0 on the placeholder React app.

> [!NOTE]
> No automated tests are introduced in this phase. The first real tests will be written alongside application logic in the MVP1 backend phase.
