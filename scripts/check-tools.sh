#!/usr/bin/env bash
# check-tools.sh — Verifies that all required development tools are installed.
# Run this before 'task setup' to confirm your environment is ready.

set -euo pipefail

ERRORS=0
WARNINGS=0

check() {
  local tool=$1
  local hint=$2
  if command -v "$tool" &>/dev/null; then
    local version
    version=$(command -v "$tool")
    echo "  ✓ $tool ($version)"
  else
    echo "  ✗ $tool — not found. $hint"
    ERRORS=$((ERRORS + 1))
  fi
}

check_optional() {
  local tool=$1
  local hint=$2
  if command -v "$tool" &>/dev/null; then
    local version
    version=$(command -v "$tool")
    echo "  ✓ $tool ($version)"
  else
    echo "  ⚠ $tool — not found (optional). $hint"
    WARNINGS=$((WARNINGS + 1))
  fi
}

check_version() {
  local tool=$1
  local cmd=$2
  local hint=$3
  if command -v "$tool" &>/dev/null; then
    local ver
    ver=$(eval "$cmd" 2>/dev/null || echo "unknown")
    echo "  ✓ $tool — $ver"
  else
    echo "  ✗ $tool — not found. $hint"
    ERRORS=$((ERRORS + 1))
  fi
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Kanbin — Development Environment Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "[ Required ]"
check_version go      "go version"       "Install from https://go.dev/dl/"
check_version node    "node --version"   "Install from https://nodejs.org/"
check_version npm     "npm --version"    "Comes with Node.js"
check_version docker  "docker --version" "Install Docker Desktop from https://www.docker.com/products/docker-desktop/"
check_version task    "task --version"   "Install from https://taskfile.dev/installation/"

# docker compose (v2 plugin — 'docker compose' rather than 'docker-compose')
echo -n "  "
if docker compose version &>/dev/null 2>&1; then
  echo "✓ docker compose — $(docker compose version 2>/dev/null | head -1)"
else
  echo "✗ docker compose — not available. Ensure Docker Desktop is up to date."
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "[ Optional — needed for linting, releases, and deployment ]"
check_optional golangci-lint "Install from https://golangci-lint.run/usage/install/"
check_optional goreleaser    "Install from https://goreleaser.com/install/"
check_optional fly           "Install from https://fly.io/docs/flyctl/install/"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$ERRORS" -gt 0 ] && [ "$WARNINGS" -gt 0 ]; then
  echo "❌ $ERRORS missing required tool(s), $WARNINGS optional tool(s) not found."
  exit 1
elif [ "$ERRORS" -gt 0 ]; then
  echo "❌ $ERRORS missing required tool(s). Please install them and try again."
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo "✅ All required tools are installed. ($WARNINGS optional tool(s) not found)"
else
  echo "✅ All required and optional tools are installed. Ready to develop!"
fi
