# Kanbin — Root Makefile
# Orchestrates build, test, lint, and dev for all components.

.PHONY: setup dev build test lint clean

# ──────────────────────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────────────────────

setup:
	@echo "==> Installing backend dependencies..."
	cd backend && go mod download
	@echo "==> Installing CLI dependencies..."
	cd cli && go mod download
	@echo "==> Installing frontend dependencies..."
	cd frontend && npm install
	@echo "==> Done. Run 'make dev' to start the development stack."

# ──────────────────────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────────────────────

dev:
	@echo "==> Starting backend and frontend dev servers..."
	@$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	cd backend && go run ./cmd/server/

dev-frontend:
	cd frontend && npm run dev

# ──────────────────────────────────────────────────────────────
# Build
# ──────────────────────────────────────────────────────────────

build: build-backend build-cli build-frontend

build-backend:
	@echo "==> Building backend..."
	@mkdir -p bin
	cd backend && go build -o ../bin/server ./cmd/server/

build-cli:
	@echo "==> Building CLI..."
	@mkdir -p bin
	cd cli && go build -o ../bin/kanbin ./cmd/kanbin/

build-frontend:
	@echo "==> Building frontend..."
	cd frontend && npm run build

# ──────────────────────────────────────────────────────────────
# Test
# ──────────────────────────────────────────────────────────────

test: test-backend test-cli test-frontend

test-backend:
	@echo "==> Testing backend..."
	cd backend && go test ./...

test-cli:
	@echo "==> Testing CLI..."
	cd cli && go test ./...

test-frontend:
	@echo "==> Testing frontend..."
	cd frontend && npm run test

# ──────────────────────────────────────────────────────────────
# Lint
# ──────────────────────────────────────────────────────────────

lint: lint-backend lint-cli lint-frontend

lint-backend:
	@echo "==> Linting backend..."
	cd backend && golangci-lint run ./...

lint-cli:
	@echo "==> Linting CLI..."
	cd cli && golangci-lint run ./...

lint-frontend:
	@echo "==> Linting frontend..."
	cd frontend && npm run lint

# ──────────────────────────────────────────────────────────────
# Clean
# ──────────────────────────────────────────────────────────────

clean:
	@echo "==> Cleaning build artifacts..."
	rm -rf bin/
	rm -rf frontend/dist/
	@echo "==> Done."
