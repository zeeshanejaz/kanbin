# Architecture Overview

Kanbin is composed of three independently deployable components that communicate exclusively via a public REST API.

## Component Diagram

```
┌─────────────┐     HTTPS      ┌─────────────────────────────┐
│   Browser   │◄──────────────►│         Frontend            │
│  (User/AI)  │                │   React + TypeScript        │
└─────────────┘                │   Vite / Static Hosting     │
                               └──────────────┬──────────────┘
                                              │ /api/* (proxy in dev,
                                              │  same origin in prod)
┌─────────────┐     HTTP/HTTPS               ▼
│     CLI     │◄──────────────►┌─────────────────────────────┐
│  (User/AI)  │                │         Backend             │
└─────────────┘                │   Go REST API               │
                               │   net/http                  │
                               └──────────────┬──────────────┘
                                              │ SQL
                                              ▼
                               ┌─────────────────────────────┐
                               │         Database            │
                               │         PostgreSQL          │
                               └─────────────────────────────┘
```

## Key Design Decisions

- **API-First**: The frontend and CLI are both consumers of the REST API. They share no special access or backdoors.
- **Stateless Backend**: Any backend instance can serve any request. Session state is in tokens; board state is in the database.
- **Separate CLI Module**: The CLI is a separate Go module (`cli/go.mod`) so it can be versioned and distributed independently.

## Request Flow (Anonymous Board View)

```
User opens browser → Frontend loads → JS fetches GET /api/boards/{key}
    → Backend reads board from DB
    → Returns board JSON
    → Frontend renders Kanban board
```

## Source Layout

```
kanbin/
├── backend/           # Go REST API (github.com/zeeshanejaz/kanbin/backend)
│   ├── cmd/server/    # Entrypoint
│   └── internal/      # Private packages (config, domain, handler, service, repository)
├── frontend/          # React + TypeScript (Vite)
│   └── src/
│       ├── api/       # Typed API client — single source of HTTP calls
│       ├── pages/     # Route-level components
│       └── components/# Reusable UI components
├── cli/               # Go CLI (github.com/zeeshanejaz/kanbin/cli)
│   ├── cmd/kanbin/    # Entrypoint
│   └── internal/      # Private packages (api client, config, output)
└── docs/              # This documentation
```
