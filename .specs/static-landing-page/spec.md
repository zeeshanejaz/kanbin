# Spec: Static HTML Landing Page for AI & Scraper Readability

**Branch:** `feature/static-landing-page`

---

## Purpose & Goals

The kanbin.app landing page is currently rendered entirely by React (SPA). On first HTTP load,
a browser (or any HTTP client) receives only a near-empty `index.html` shell that loads a
JavaScript bundle — no real content. This makes the page:

- Invisible to AI agents that parse raw HTML (e.g., LLM web-fetch tools)
- Invisible to SEO crawlers that do not execute JavaScript
- Unusable by content scrapers, `curl`, `wget`, or any tool doing a simple GET

Since Kanbin's target audience is explicitly AI agents and developers, the marketing/docs
landing page must be readable without JavaScript execution.

---

## Solution Overview

Split the landing page (pure marketing & documentation content) away from the React SPA
(interactive board UI). Serve the landing page as a standalone, self-contained static HTML
file directly from Nginx. The React SPA continues to serve only the board-interaction routes
(`/b/:key`, `/home`, etc.).

```
/                     → static index.html  (plain HTML, no JS framework)
/b/:key               → React SPA (app.html)
/home                 → React SPA (app.html)
/api/*                → proxy → backend API
```

---

## Key Requirements

### Landing Page (Static HTML)
- Served at `/` as a complete, plain HTML5 document
- No React, no Vite JS bundle, no client-side rendering required
- All content visible in `curl -s https://kanbin.app` output
- All content in existing `Landing.tsx` is preserved: hero, use-cases, quickstart,
  API reference, CLI reference, data models, philosophy, architecture, self-hosting, footer
- CSS extracted from `Landing.css` and embedded / inlined into the HTML file
  or served as a separate static asset (e.g. `landing.css`)
- Google Fonts loaded via `<link>` in `<head>` (no change)
- "Create Board" form: minimal vanilla JS inline script that calls `POST /api/boards`
  and redirects the browser to `/b/:key` on success — **no React, no build tools**
- Fully functional without JavaScript (degraded gracefully: form submits as-is, no fancy error)
- Valid, semantic HTML5 (proper heading hierarchy, `<nav>`, `<main>`, `<section>`, `<footer>`, etc.)
- All existing CSS classes and visual design preserved — no visual regression

### React SPA (App Shell)
- Vite entry point renamed from `index.html` → `app.html`
- `vite.config.ts` updated to use `app.html` as build input
- React Router: remove the `/` `Landing` route; redirect `/` → `/home` or keep `/home` as default
- All board routes (`/b/:key`) and home (`/home`) unaffected

### Nginx Configuration
- `nginx.conf` (production / fly.io): 
  - Serve `index.html` literally for `GET /` (not via `try_files` fallback)
  - `try_files` fallback to `app.html` for SPA paths (`/b/…`, `/home`, etc.)
  - `/api/` proxy rule unchanged
- `nginx.self-host.conf`: same routing changes applied

### Docker / Build
- `Dockerfile` for frontend: no changes needed (static files are still built to `dist/`)
- `vite.config.ts`: add explicit `build.rollupOptions.input` with `app.html`
- `frontend/public/index.html` — Vite copies `public/` to `dist/` verbatim;
  this is how the static landing page lands in the final build

---

## Technical Approach

### Why `frontend/public/index.html`?

Vite copies everything in `frontend/public/` directly into `dist/` without processing.
Placing the static landing HTML at `frontend/public/index.html` means it lands at
`dist/index.html` in production. This is the file Nginx serves for `GET /`.

Vite's own build output is renamed to `app.html` by changing its entry point.
There is no file conflict because Vite only writes `app.html` (not `index.html`) to `dist/`.

### Create Board Form — Vanilla JS

The hero section form requires:
1. `POST /api/boards` with `{"title": "<user input>"}`
2. On `201`, redirect to `/b/:key` (React SPA path)

This is ~20 lines of inline `<script>` at the bottom of the HTML file. No dependencies.

### Content Parity

Every section in `Landing.tsx` maps 1:1 to a section in the static HTML:

| Section | `Landing.tsx` element | HTML element |
|---|---|---|
| Navbar | `<nav class="l-navbar">` | `<nav>` |
| Hero | `<header class="l-hero">` | `<header>` |
| Use Cases | `<section id="use-cases">` | `<section id="use-cases">` |
| Quickstart | `<section id="quickstart">` | `<section id="quickstart">` |
| API Reference | `<section id="api">` | `<section id="api">` |
| CLI Reference | `<section id="cli">` | `<section id="cli">` |
| Data Models | `<section id="models">` | `<section id="models">` |
| Philosophy | `<section id="philosophy">` | `<section id="philosophy">` |
| Architecture | `<section id="architecture">` | `<section id="architecture">` |
| Self-Hosting | `<section id="self-hosting">` | `<section id="self-hosting">` |
| Footer | `<footer class="l-footer">` | `<footer>` |

---

## User Interactions & Workflows

### Happy path — AI agent scraping
1. Agent does `GET https://kanbin.app/`
2. Receives full HTML with all documentation, API endpoints, use cases
3. No JavaScript execution required

### Happy path — human creates board
1. User visits `https://kanbin.app/`
2. Sees the landing page with the "Create Board" form
3. Enters a board name (e.g. `sprint-42`)
4. Clicks "Create Board →"
5. Vanilla JS fires `POST /api/boards`, receives `{ key: "a1b2c3d4" }`
6. Browser navigates to `/b/a1b2c3d4` — React SPA loads & renders board
7. Board experience is unchanged

### Happy path — human views board directly
1. User visits `https://kanbin.app/b/a1b2c3d4`
2. Nginx matches `/b/*` → serves `app.html` (React SPA entry)
3. React SPA loads, renders board

### Anchor navigation
- All `#quickstart`, `#api`, `#cli` etc. links in the static page work as native HTML anchors
- Navbar mobile toggle works via inline script (no framework needed)

---

## Technical Constraints & Considerations

- Font loading: Google Fonts `<link>` must remain in `<head>` (already present in current `index.html`)
- CSS animations / scroll reveal: current implementation uses `IntersectionObserver` in React.
  Scroll reveal should be re-implemented as a small inline script or omitted for simplicity.
  Visual appearance should be preserved but these are progressive enhancement only.
- No build-time templating: the static HTML is committed as-is; no Handlebars/Pug/etc.
- The `Landing.tsx` component and `Landing.css` file remain in the repo but are no longer imported
  by any route. They can be removed in a follow-up cleanup PR.
- The build outputs both `dist/index.html` (static) and `dist/app.html` (SPA); this changes
  the Nginx `root` setup slightly — test both production and self-host configs.

---

## Testing & Validation

### Functional
- [ ] `curl -s http://localhost:3000/` returns full HTML with text content (no empty body)
- [ ] `curl -s http://localhost:3000/ | grep "Quickstart"` returns a match
- [ ] `curl -s http://localhost:3000/ | grep "POST /api/boards"` returns a match
- [ ] Creating a board from the landing page form navigates correctly to `/b/:key`
- [ ] Navigating to `http://localhost:3000/b/<valid-key>` loads the React board view
- [ ] All anchor links (`#api`, `#cli`, etc.) scroll correctly

### Visual (manual)
- [ ] Landing page appearance matches the React version
- [ ] Scroll animations visible (nice-to-have; not blocking)
- [ ] Mobile nav toggle works
- [ ] No broken fonts, icons, or layout issues

### Edge Cases
- [ ] Empty board name: form does not submit (HTML `required` attribute)
- [ ] API error on board creation: user sees a visible error message
- [ ] Direct visit to `/home` loads React SPA correctly
- [ ] Direct visit to `/b/nonexistent` loads React SPA and shows 404 state

---

## Implementation Phases

### Phase 1 — Static HTML Landing Page
**Goal:** Create `frontend/public/index.html` as a self-contained static HTML file with all landing content.

- 1.1 Extract and inline CSS from `Landing.css` into a linked `landing.css` placed in `frontend/public/`
- 1.2 Write the full `frontend/public/index.html` with structural parity to `Landing.tsx`
- 1.3 Add inline vanilla JS for: Create Board form, navbar scroll morph, scroll reveal, mobile menu toggle

### Phase 2 — Vite & React App Refactor
**Goal:** Move the React SPA to a non-root entry so it co-exists with the static landing.

- 2.1 Rename `frontend/index.html` → `frontend/app.html`
- 2.2 Update `vite.config.ts` to use `app.html` as the build entry (`build.rollupOptions.input`)
- 2.3 Update `frontend/src/App.tsx`: remove Landing route from `/`; redirect `/` to `/home` or keep `/home` as default landing
- 2.4 Verify `npm run build` produces `dist/app.html` + `dist/index.html` (static copy)

### Phase 3 — Nginx Routing Changes
**Goal:** Route traffic correctly in both production and self-host configurations.

- 3.1 Update `frontend/nginx.conf`:
  - Add explicit `location = /` to serve `index.html` directly
  - Change SPA fallback from `index.html` → `app.html`
- 3.2 Apply same changes to `frontend/nginx.self-host.conf`

### Phase 4 — Validation & Cleanup
**Goal:** Verify everything works end-to-end and optionally remove dead code.

- 4.1 Local end-to-end test with `docker compose up`
- 4.2 Verify `curl /` returns full HTML content
- 4.3 Verify board creation from landing form works
- 4.4 Verify `/b/:key` loads the React SPA
- 4.5 (Optional) Remove or archive `Landing.tsx` and `Landing.css`
