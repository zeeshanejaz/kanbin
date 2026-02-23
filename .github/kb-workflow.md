# KB CLI Workflow Guide

## Overview

The `kb` utility is Kanbin's command-line interface for managing boards and tasks. This guide describes best practices for using the CLI during development workflows.

## Core Workflow: One Board Per Branch

### Philosophy

Create a dedicated Kanban board for each feature branch to track work items, maintain context, and enable AI agents to monitor progress throughout development.

### Benefits

- **Isolated Context**: Each branch has its own task tracking separate from other work
- **Clear Progress**: Visual representation of work completion for the branch
- **Agent Integration**: AI assistants can reference board state and task IDs
- **Historical Record**: Board persists as documentation of what was done

## Step-by-Step Workflow

### 1. Create a New Branch and Board

When starting new work:

```bash
# Create and checkout your feature branch
git checkout -b feature/123-add-user-auth

# Create a corresponding board
kb board create "Feature 123: User Authentication"

# Output example:
# Board created successfully!
# Title: Feature 123: User Authentication
# Key:   a1b2c3d4e5f67890abcdef1234567890
```

**💡 Important**: Save the **Board Key** — you'll reference it throughout development.

### 2. Planning Stage: Create Tasks

Before coding, break down your work into tasks:

```bash
# Create tasks for your board
kb task add "Set up database schema for users" --board a1b2c3d4e5f67890abcdef1234567890
kb task add "Implement password hashing utility" --board a1b2c3d4e5f67890abcdef1234567890
kb task add "Create user registration endpoint" --board a1b2c3d4e5f67890abcdef1234567890
kb task add "Add authentication middleware" --board a1b2c3d4e5f67890abcdef1234567890
kb task add "Write unit tests for auth flow" --board a1b2c3d4e5f67890abcdef1234567890

# Each task returns:
# Task created successfully!
# Task ID: 660e8400-e29b-41d4-a716-446655440001
```

**💡 Best Practice**: Save task IDs in a temporary note or your branch description for quick reference.

### 3. During Development: Update Task Status

As you work, update task status to reflect progress:

```bash
# Mark task as in-progress when you start
kb task move <TASK-ID> --status IN_PROGRESS --board <BOARD-KEY>

# Mark as complete when done
kb task move <TASK-ID> --status DONE --board <BOARD-KEY>

# View current board state
kb board view <BOARD-KEY>
```

### 4. Reference Format for AI Agents

Keep this information accessible in your workspace:

```markdown
## Current Work Context

**Branch**: feature/123-add-user-auth
**Board Key**: a1b2c3d4e5f67890abcdef1234567890

**Tasks**:
- [ ] Set up database schema (660e8400-e29b-41d4-a716-446655440001) - TODO
- [~] Implement password hashing (660e8400-e29b-41d4-a716-446655440002) - IN_PROGRESS
- [ ] Create registration endpoint (660e8400-e29b-41d4-a716-446655440003) - TODO
- [ ] Add auth middleware (660e8400-e29b-41d4-a716-446655440004) - TODO
- [ ] Write unit tests (660e8400-e29b-41d4-a716-446655440005) - TODO
```

**Where to keep this**:
- In a `.work-context.md.local` file in your branch (ignored by git)
- In your PR description template
- In a pinned note in your editor
- As a comment in relevant code files

## CLI Command Reference

### Board Commands

```bash
# Create a board
kb board create "<board-name>"

# List all boards
kb board list

# View board details and tasks
kb board view <BOARD-KEY>

# Delete a board (when branch is merged and done)
kb board delete <BOARD-KEY>
```

### Task Commands

```bash
# Create a task
kb task add "<task-title>" --board <BOARD-KEY>

# Update task status
kb task move <TASK-ID> --status <TODO|IN_PROGRESS|DONE> --board <BOARD-KEY>

# List all tasks on a board
kb task list --board <BOARD-KEY>

# Delete a task
kb task delete <TASK-ID> --board <BOARD-KEY>
```

## Integration with AI Agents

### Providing Context to Agents

When working with AI coding assistants (like GitHub Copilot), provide your board context:

```markdown
I'm working on feature branch `feature/123-add-user-auth`.
Board Key: a1b2c3d4e5f67890abcdef1234567890

Current tasks:
- Database schema setup (TASK-001) - Done ✓
- Password hashing (TASK-002) - In Progress
- Registration endpoint (TASK-003) - Todo
- Auth middleware (TASK-004) - Todo
- Unit tests (TASK-005) - Todo

Please help me with TASK-002 (password hashing implementation).
```

### Agent Benefits

With board context available, AI agents can:
- Reference specific task IDs when implementing features
- Suggest updating task status after completing work
- Verify implementation aligns with planned tasks
- Track overall branch progress
- Recommend next steps based on remaining tasks

## Best Practices

### ✅ Do

- **Create board at branch creation**: Establish context immediately
- **Plan tasks upfront**: Break down work before starting implementation
- **Update status regularly**: Keep board current as you work
- **Use descriptive task titles**: Make tasks self-explanatory
- **Reference task IDs in commits**: Link commits to specific tasks
- **Keep IDs accessible**: Store board/task IDs where you can easily copy them
- **Clean up after merge**: Archive or delete boards for merged branches

### ❌ Don't

- **Don't reuse boards across branches**: Each branch should have its own board
- **Don't create overly granular tasks**: Keep tasks at a meaningful level
- **Don't forget to update status**: Stale boards lose value
- **Don't lose track of IDs**: Without IDs, you can't update tasks

## Example Workflow Session

```bash
# 1. Start new branch
git checkout -b feature/456-task-filtering

# 2. Create board
kb board create "Feature 456: Task Filtering"
# Save key, e.g.: f9e8d7c6b5a4321098765432fedcba01

# 3. Plan tasks
kb task add "Add filter UI component" --board f9e8d7c6b5a4321098765432fedcba01            # TASK-A1
kb task add "Implement backend filter logic" --board f9e8d7c6b5a4321098765432fedcba01     # TASK-A2
kb task add "Add filter query parameters" --board f9e8d7c6b5a4321098765432fedcba01        # TASK-A3
kb task add "Write integration tests" --board f9e8d7c6b5a4321098765432fedcba01            # TASK-A4

# 4. Start work on first task
kb task move TASK-A1 --status IN_PROGRESS --board f9e8d7c6b5a4321098765432fedcba01

# ... implement filter UI ...

# 5. Complete first task
kb task move TASK-A1 --status DONE --board f9e8d7c6b5a4321098765432fedcba01

# 6. Start next task
kb task move TASK-A2 --status IN_PROGRESS --board f9e8d7c6b5a4321098765432fedcba01

# ... continue until all tasks done ...

# 7. View final board state before PR
kb board view f9e8d7c6b5a4321098765432fedcba01

# 8. After PR merged, clean up
kb board delete f9e8d7c6b5a4321098765432fedcba01
```

## Tips for Maximum Effectiveness

1. **Create a template**: Keep a template for tracking board context in your notes
2. **Alias common commands**: Set up shell aliases for frequent operations
   ```bash
   alias kbc='kb board create'
   alias kbv='kb board view'
   alias kta='kb task add'
   alias ktm='kb task move'
   ```
3. **Include in PR template**: Add board key and task summary to your PR descriptions
4. **Pair with /spec command**: Create board tasks based on specification phases
5. **Update during standups**: Review board state during team check-ins

## Troubleshooting

**Lost board key?**
```bash
kb board list  # Shows all boards with their keys
```

**Forgot task IDs?**
```bash
kb board view <BOARD-KEY>  # Lists all tasks with IDs
```

## Integration with Project Workflows

This KB workflow complements the `/spec` and `/implement` commands:

1. Run `/spec` to create specification
2. Create board and tasks based on spec phases
3. Run `/implement` and reference task IDs throughout
4. Update task status as implementation progresses
5. Use `/pr-checklist` to verify completion
6. Reference board in PR message

---

**For more information**: See the main project documentation and CLI help (`kb --help`)
