# Kanbin

[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat&logo=go)](https://go.dev)
[![Node Version](https://img.shields.io/badge/Node-20+-339933?style=flat&logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Lightweight, ephemeral Kanban boards for humans and AI agents. Create a board instantly — no sign-up required — share the key, and let it expire when the work is done.

## ✨ Features

- **🚀 Instant Setup**: No registration, no login — just create and share
- **🔑 Key-Based Access**: Each board gets a unique access key
- **⚡ Real-time Sync**: Updates reflect instantly across all clients
- **🎨 Drag & Drop**: Intuitive drag-and-drop task management
- **💻 CLI + Web**: Use the web UI or command-line interface
- **🤖 AI-Friendly**: Perfect for AI agents tracking their own tasks
- **📦 Self-Hostable**: Deploy on your own infrastructure

## Components

| Component | Language | Description |
|---|---|---|
| `backend/` | Go | REST API server |
| `frontend/` | React + TypeScript | Web UI |
| `cli/` | Go | Command-line interface |

## Installation

### Homebrew (Coming Soon)
```bash
brew tap zeeshanejaz/tap
brew install kanbin
```

### Scoop (Coming Soon)
```powershell
scoop bucket add kanbin https://github.com/zeeshanejaz/scoop-bucket
scoop install kanbin
```

### Winget (Coming Soon)
```powershell
winget install zeeshanejaz.kanbin
```

### Via Go
```bash
go install github.com/zeeshanejaz/kanbin/cli/cmd/kanbin@latest
```

### Manual Download
Download the latest binaries for Windows, macOS, and Linux from the [GitHub Releases](https://github.com/zeeshanejaz/kanbin/releases) page.

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

Kanbin includes a command-line interface available as both `kanbin` and the shorthand `kb`. If you've installed it via a package manager or `go install`, it will be in your PATH. If you've built it from source, the binaries are located in the `bin/` directory.

### Backend Server URL
By default, the CLI connects to the production server at `https://kanbin.app/api`. You can override this in two ways:

1.  **Global Flag:** Use the `--server` (or `-s`) flag.
    ```bash
    kb --server http://localhost:8080/api board view <KEY>
    ```
2.  **Environment Variable:** Set the `KANBIN_URL` variable.
    ```bash
    export KANBIN_URL=http://localhost:8080/api
    kb board view <KEY>
    ```

### Basic Commands
```bash
# General help
kb --help

# Create a new key-based anonymous board
kb board create "My CLI Board"

# View a board and its tasks
kb board view <BOARD_KEY>

# Add a new task to a board
kb task add "Implement auth" --board <BOARD_KEY>
```

## Documentation

- [Local Development Guide](docs/local-dev.md)
- [Architecture Overview](docs/architecture.md)
- [REST API Reference](docs/api.md)

## Project Specifications

See [`.specs/`](.specs/) for the project constitution, product specifications, and MVP delivery plan.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Setting up your development environment
- Code style and standards
- Submitting pull requests
- Reporting issues

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/zeeshanejaz/kanbin/issues)
- 💬 [Discussions](https://github.com/zeeshanejaz/kanbin/discussions)
