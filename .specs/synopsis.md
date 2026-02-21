# Kanbin — Project Synopsis

## What Is Kanbin?

**Kanbin** is a lightweight, ephemeral Kanban board service built for the new era of agentic software development. It provides fast, no-friction project boards that can be created instantly, used briefly, and discarded — much like a whiteboard you wipe clean when the work is done.

The name "kanbin" blends *kanban* (看板, the Japanese scheduling concept) with a casual, abbreviated feel reflecting its throw-away nature.

---

## The Problem

Modern AI agents working on short-lived software tasks produce progress that is hard for humans to observe. Console logs are noisy and ephemeral. Chain-of-thought tokens are opaque. Classic project management tools (Jira, Trello, Linear, etc.) are:

- Too heavy to set up for a single task or sprint
- Not designed to be disposable
- Not friendly to programmatic, agent-driven interaction
- Overkill for work that will be done in hours or days

There is a gap between "nothing" and "full project management suite" — and that gap is where most agentic work happens today.

---

## The Idea

Kanbin fills this gap by offering **throw-away Kanban boards** inspired by tools like Pastebin and HTTPBin:

- **No signup required** to create a board
- Boards are identified by a **board key** (like a Pastebin slug) — shareable, memorable, and key-based
- Boards **expire automatically after 1 week** by default, keeping the service clean and cost-controlled
- Human observers and AI agents alike can read and update a board using either the **web UI**, a **REST API**, or a **CLI tool**

Think of it as a lightweight scratchpad for tracking task progress — perfect for a 2-hour coding sprint, a weekend side project, or an AI agent running an automated build pipeline.

---

## Core Philosophy

| Principle | Description |
|---|---|
| **Ephemeral by default** | Boards expire unless you explicitly want them to persist |
| **Zero friction entry** | No account needed; just create a board and share the key |
| **Agent-first design** | The CLI and API are first-class interfaces, not afterthoughts |
| **Progressive commitment** | Anonymous → Free team → Paid team, each adding durability and features |
| **Minimal surface area** | Only the features that matter for a task board, nothing else |

---

## Components

Kanbin is composed of three integrated components:

1. **Backend** — A fast, memory-efficient server exposing a REST API
2. **Frontend** — A clean, interactive web UI for viewing and managing boards
3. **CLI** — A command-line interface for scripted or agent-driven interaction

---

## Target Users

- **AI agents** running autonomous coding or research tasks that want to surface progress
- **Solo developers** who want a quick scratchpad board without signing up for anything
- **Small teams** that want lightweight ephemeral boards without adopting a full PM suite
- **Hackers and open-source contributors** running short-lived sprints

---

## Inspiration

| Tool | What Kanbin borrows |
|---|---|
| Pastebin | Anonymous creation, key-based sharing, auto-expiry |
| HTTPBin | Developer/agent-friendly interface, quick setup |
| Linear | Clean, minimal Kanban UX |
| Trello | Simple swim-lane concept |
