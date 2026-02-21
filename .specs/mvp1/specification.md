# MVP1 Specification — Anonymous Boards

## Overview
MVP1 focuses on providing a functional Kanban board experience without any user authentication. It allows users to create a board, receive a unique key, and perform standard Kanban operations.

## User Persona
- **Quick-Start User**: Someone who needs a board right now for a short-term task and doesn't want to create an account.
- **AI Agent**: A program that needs to track state or coordinate tasks with a human or another agent via a shared board.

## Functional Requirements

### 1. Board Management
- **Create Board**: Users can create a board by providing a title. The system returns a unique `board_key` (short, URL-friendly).
- **View Board**: Anyone with the `board_key` can view the board and all its tasks.
- **Delete Board**: Users can delete a board using its `board_key`.
- **Search Boards**: A simple text-based search for boards (accessible via CLI/API).

### 2. Task Management (CRUD)
- **Create Task**: Add a task to a board with a title and optional description.
- **Read Task**: View details of a specific task.
- **Update Task**: Modify task title, description, or status.
- **Status Flow**: Tasks move between three hardcoded statuses: `TODO`, `IN_PROGRESS`, `DONE`.
- **Delete Task**: Remove a task from the board.

### 3. Constraints & Lifecycle
- **Task Limit**: Maximum 100 tasks per board.
- **Board Expiry**: Boards expire 7 days after creation. Expired boards are either deleted or made inaccessible.

## Data Model

### Board
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Internal primary key |
| `key` | String | Public unique key (e.g., `fast-cat-42`) |
| `title` | String | Human-readable title |
| `created_at` | Timestamp | Creation time |
| `expires_at` | Timestamp | `created_at` + 7 days |

### Task
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Internal primary key |
| `board_id` | UUID | Foreign key to Board |
| `title` | String | Short summary |
| `description` | String | Detailed text (optional) |
| `status` | Enum | `TODO`, `IN_PROGRESS`, `DONE` |
| `position` | Integer | Sort order within the status column |
| `created_at` | Timestamp | Creation time |
| `updated_at` | Timestamp | Last modified time |

## Interface Requirements

### REST API
- `POST /api/boards` - Create a board
- `GET /api/boards/:key` - Get board details + tasks
- `DELETE /api/boards/:key` - Delete a board
- `POST /api/boards/:key/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Web Frontend
- Simple, responsive React UI.
- Home page with "Create Board" button.
- Board view with three columns.
- Drag-and-drop or simple "Move" buttons for status changes.

### CLI
- **Alias**: The CLI supports the alias `kb` for convenience.
- `kb board create "My Project"`
- `kb task add "Fix the bug" --board <key>`
- `kb task list --board <key>`
- `kb task move <id> --status IN_PROGRESS`
