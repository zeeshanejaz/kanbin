#!/usr/bin/env bash
# check-tools.sh — Verifies that all required development tools are installed.
# Run this before 'task setup' to confirm your environment is ready.

set -euo pipefail

ERRORS=0

check() {
  local tool=$1
  local hint=$2
  if command -v "$tool" &>/dev/null; then
    echo "  ✓ $tool ($(command -v "$tool"))"
  else
    echo "  ✗ $tool — not found. $hint"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "Checking required tools..."
check go           "Install from https://go.dev/dl/"
check node         "Install from https://nodejs.org/"
check npm          "Comes with Node.js"
check task         "Install from https://taskfile.dev/installation/"
check golangci-lint "Install from https://golangci-lint.run/usage/install/"

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "❌ $ERRORS missing tool(s). Please install them and try again."
  exit 1
else
  echo "✅ All required tools are installed."
fi
