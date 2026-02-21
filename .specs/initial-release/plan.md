# Kanbin Initial Release & Distribution Plan

This document outlines the strategy for releasing and distributing all components of the Kanbin application (Backend, Frontend, and CLI) for public use.

## Distribution Goals

1. **CLI Accessibility:** The `kanbin` (and `kb`) CLI must be easily installable by anyone across different operating systems (Windows, macOS, Linux).
2. **Cost-Effective Hosting:** The web infrastructure (Frontend, Backend, and Database) will be deployed on [Fly.io](https://fly.io) to minimize running costs while maintaining good edge performance.
3. **Custom Domain:** All web traffic and API requests will be routed through `kanbin.app`.

---

## Infrastructure Overview (Fly.io)

Fly.io will host three separate applications within the same organization/network:
1. **PostgreSQL Database:** A Fly Postgres cluster (single node for cost reduction initially).
2. **Go Backend API:** A scalable Fly machine running the compiled Go binary.
3. **React Frontend:** Since the frontend is static (Vite build), it can be served using a lightweight static file server (e.g., Nginx, Caddy, or a Go static server) deployed as a Fly machine, or utilizing Fly's built-in static hosting capabilities.

---

## Developer / Deployer Action List

To successfully deploy Kanbin to production, the deploying developer must complete the following actions:

### Phase 1: Prerequisites & Accounts
- [ ] **Domain Registration:**
  - Purchase the domain `kanbin.app` from a domain registrar (e.g., Cloudflare, Namecheap, Google Domains).
- [ ] **Fly.io Setup:**
  - Sign up for a [Fly.io account](https://fly.io).
  - Install the `flyctl` command-line tool locally.
  - Authenticate the CLI (`fly auth login`).
  - Add a credit card to the Fly.io account to enable deploying applications and provisioning Postgres.
- [ ] **GitHub Account (for CLI Releases):**
  - Ensure you have admin access to the Kanbin GitHub repository to manage Releases and Actions.

### Phase 2: Deploying to Fly.io
- [ ] **Provision Database:**
  - Run `fly postgres create` to create the `kanbin-db` cluster. Note the connection string.
- [ ] **Deploy Backend:**
  - Create a `fly.toml` configuration for the backend.
  - Set the `DATABASE_URL` secret on the backend app (`fly secrets set DATABASE_URL="..."`).
  - Deploy the backend (`fly deploy`).
- [ ] **Deploy Frontend:**
  - Create a `Dockerfile` for the frontend (e.g., using Nginx to serve the `dist` folder).
  - Create a `fly.toml` configuration for the frontend.
  - Configure the frontend build to point its `apiClient` base URL to the production backend URL (or configure Fly to route `/api` to the backend app).
  - Deploy the frontend (`fly deploy`).

### Phase 3: Domain & SSL Configuration
- [ ] **Configure DNS:**
  - In Fly.io, add the custom domain `kanbin.app` to the frontend application (`fly certs add kanbin.app`).
  - Update your domain registrar's DNS records, adding the A and AAAA records provided by Fly.io to point `kanbin.app` to the frontend app.
- [ ] **Verify SSL:**
  - Wait for Fly.io to issue and verify the Let's Encrypt SSL certificates.

### Phase 4: CLI Distribution (GitHub Actions)
- [x] **Release Automation:**
  - Create a `.github/workflows/release.yml` file to automate binary builds using [GoReleaser](https://goreleaser.com/).
  - Configure GoReleaser to build for Windows (`.exe`), macOS (`darwin`), and Linux.
  - Set the workflow to trigger on Git tags (e.g., `v1.0.0`).
- [x] **Package Managers (Optional but Recommended):**
  - Homebrew (macOS/Linux): Create a custom Homebrew tap repository so users can run `brew install zeeshanejaz/tap/kanbin`.
  - Scoop/Winget (Windows): Add manifests for Windows package managers.
  - Go Install: Ensure users can run `go install github.com/zeeshanejaz/kanbin/cli/cmd/kanbin@latest`.

---

## Final CLI Installation Instructions (for Users)

Once the distribution plan is executed, users will be able to install the CLI using their preferred method:

**Via Homebrew (macOS/Linux):**
```bash
brew install zeeshanejaz/tap/kanbin
```

**Via Go (Any OS):**
```bash
go install github.com/zeeshanejaz/kanbin/cli/cmd/kanbin@latest
```

**Manual Download:**
Download the pre-compiled binaries for Windows, macOS, and Linux directly from the [GitHub Releases](https://github.com/zeeshanejaz/kanbin/releases) page.
