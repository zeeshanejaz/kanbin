# Kanbin — Project Constitution

> This document defines the foundational decisions and principles guiding Kanbin's development. It is the source of truth for technical choices, coding style, and engineering values. It is intentionally left free of implementation detail — those belong in implementation plans for each MVP.

---

## Technology Stack

### Backend

- **Language:** Go
- **Rationale:** Compiled, fast startup, excellent concurrency primitives, minimal memory footprint, ideal for a lightweight API server with high throughput and low infrastructure cost

### Frontend

- **Framework:** React with TypeScript
- **Rationale:** Industry-standard component model, strong typing reduces runtime bugs, broad ecosystem, good tooling for both developer experience and production builds

### CLI

- **Language:** Go (same as backend)
- **Rationale:** Single binary distribution, shares domain types with backend, no runtime dependency on Node.js or Python

---

## Architectural Principles

### 1. Simplicity Over Cleverness
Prefer straightforward, readable solutions over clever optimisations. The codebase should be easy for a new contributor (human or AI) to understand within minutes of reading a file.

### 2. Separation of Concerns
Each component (backend, frontend, CLI) is independently deployable and has a clearly defined responsibility boundary. They communicate only via the public REST API.

### 3. API-First
The REST API is the canonical interface. Both the UI and CLI are consumers of the API — they get no special treatment or backdoors. This ensures the API is well-designed for external use.

### 4. Stateless by Default
The backend is designed to be stateless. Session state lives in tokens; board state lives in the database. Any backend instance should be able to serve any request.

### 5. Fail Loudly in Development, Fail Gracefully in Production
During development, prefer panics and hard assertion failures to silent incorrect behaviour. In production, return appropriate HTTP error codes with descriptive JSON error bodies.

### 6. Progressive Enhancement
Anonymous access is a first-class citizen. Authenticated features should layer on top of the anonymous flow, not replace it.

---

## Coding Style

### Go (Backend & CLI)

- Follow the [Effective Go](https://go.dev/doc/effective_go) guidelines
- Use `gofmt` for formatting — no exceptions
- Lint with `golangci-lint` using a standard ruleset
- Errors are always handled explicitly — no `_` ignoring of returned errors
- Prefer flat package structures; avoid deep nesting
- Use `context.Context` for all I/O operations to support cancellation and deadlines
- Exported symbols must have doc comments
- Test files live alongside the code they test (`*_test.go`)

### TypeScript / React (Frontend)

- Use **strict TypeScript** (`"strict": true` in `tsconfig.json`)
- Prefer functional components with hooks over class components
- No `any` types — use `unknown` and narrow properly
- Use named exports over default exports for components
- Co-locate component styles with their component file
- Component filenames use PascalCase; utility/hook files use camelCase
- All API calls go through a typed client layer — no raw `fetch` calls in components

### General

- No commented-out code committed to the repository
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, etc.
- No secrets or credentials committed to the repository (use environment variables)

---

## Git Workflow

Kanbin uses **trunk-based development**:

- `main` is the trunk — it must always be in a releasable state
- Work is done on short-lived **feature branches** branched from `main`
- Before merging, feature branches are **rebased onto `main`** to incorporate any upstream changes and maintain a linear commit history
- Branches are merged back into `main` using **`--no-ff`** (no fast-forward), so that the merge commit is preserved and the branch topology remains visible in the log
- Direct commits to `main` are only permitted for trivial fixes (typos, doc corrections); all other changes go through a feature branch

This gives us the best of both worlds: a visually clean, linear history on each branch, and a clear record in `main`'s log of when and what was merged.

---


## Repository Structure (Planned)

```
kanbin/
├── .specs/            # Project specifications (this folder)
├── backend/           # Go server (REST API)
├── frontend/          # React TypeScript web app
├── cli/               # Go CLI binary
├── docs/              # Developer documentation
└── README.md
```

> Exact package and directory structure within each component is defined in the relevant MVP implementation plan.

---

## Testing Philosophy

- **Unit tests** for business logic (board rules, expiry, limits)
- **Integration tests** for API endpoints (at least happy path + key error cases)
- **No requirement for 100% coverage** — focus on testing behaviour, not lines
- Frontend components are tested where logic is non-trivial; pure rendering tests are optional
- CLI commands are tested via integration tests against a running backend (or mock server)

---

## Design Values (UI/UX)

- **Clarity over decoration** — the board is the product; UI chrome should be minimal
- **Speed** — page loads and interactions must feel instant; optimise for perceived performance
- **Keyboard-friendly** — power users and agent-driven workflows may rely on keyboard navigation
- **Mobile-aware** — responsive layout is a baseline requirement; native mobile app is out of scope
- **Transparent limits** — quotas, expiry dates, and limits are always visible to the user, never hidden

---

## Security Principles

- Board keys must be sufficiently random to prevent enumeration attacks (at least 128 bits of entropy)
- Passwords are hashed with a modern, slow algorithm (e.g. bcrypt or argon2)
- API endpoints that mutate state require the board key (anonymous) or a valid auth token (authenticated)
- No sensitive data in URL query parameters
- HTTPS is assumed in production; no HTTP-only deployments

---

## Out of Scope (Permanently, for MVP1–MVP3)

The following are explicitly out of scope for MVP1–MVP3 and should not be designed around:

- File attachments on tasks
- Real-time collaborative updates (websockets, live sync)
- Mobile native apps (iOS / Android)
- Role-based access control within a team (all members are equal)
- Webhooks or integrations with third-party tools
- Audit logs
- Board templates

> **Deferred to MVP4:** Custom swim lanes and Enterprise SSO (SAML/OIDC) are planned but out of scope until MVP4. The architecture should not preclude them, but no implementation should be built for them earlier.
