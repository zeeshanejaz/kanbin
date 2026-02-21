# Kanbin — Product Specifications

## Board Model

### Anatomy of a Board

| Field | Description |
|---|---|
| `board_key` | Unique, human-readable identifier generated at creation. Used to access the board. |
| `title` | Optional short name for the board |
| `swim_lanes` | Default: **Pending**, **In Progress**, **Completed** |
| `tasks` | List of task cards on the board |
| `owner` | `anonymous` or a team ID |
| `created_at` | Creation timestamp |
| `expires_at` | Computed expiry date based on tier rules |
| `status` | `active` \| `pending_deletion` \| `deleted` |

### Anatomy of a Task

| Field | Description |
|---|---|
| `task_id` | Unique identifier within the board |
| `title` | Short task title |
| `description` | Longer free-text description |
| `status` | One of the board's swim-lane names |
| `created_at` | Creation timestamp |
| `updated_at` | Last updated timestamp |

---

## Authentication & Access

### Anonymous Users

- No signup required
- Any visitor can create a board
- Upon creation, a **board key** is returned — this is the sole credential for managing that board
- The board key must be provided for all write operations on that board
- Anonymous boards:
  - Have a **100-task limit** (displayed prominently in the UI)
  - Expire automatically after **7 days**
  - Cannot be recovered after expiry

### Authenticated Users & Teams

- Users may sign up using an **email address and password**
- At signup, a **team** is automatically created and linked to the user's account
- Existing anonymous boards can be **linked to a team** using their board key after signup
- Once boards are linked to a team, expiry and limits are governed by the team's plan
- All team members have **equal permissions** (no role hierarchy)

---

## Feature Matrix

### Actions Available via Both CLI and UI

| Action | Description |
|---|---|
| `login` | Authenticate as a registered user |
| `logout` | End authenticated session |
| `create board` | Create a new board (anonymous or team-linked) |
| `create task` | Add a new task to a board |
| `update task title` | Rename a task |
| `update task description` | Edit task body |
| `update task status` | Move a task to a different swim lane |
| `delete task` | Remove a task from a board |
| `delete board` | Mark a board for deletion |
| `read task` | View full details of a single task |
| `read board` | View board metadata and all tasks |
| `search board` | Search tasks by full-text within a board |

### Additional UI-Only Features

| Feature | Description |
|---|---|
| Signup | Register via email + password |
| Team management | Create teams, invite/remove members |
| User management | View and manage team members |
| Billing management | Upgrade/downgrade plan; view subscription |
| Board management | View all team boards in one place |
| Board view by key | Anyone with a board key can view that board in the browser |

### CLI-Specific Features

| Feature | Description |
|---|---|
| `help` | List all commands with parameter descriptions |

---

## Business Model

### Tiers

| Tier | Price | Boards | Board Expiry | Task Limit | Deletion Recovery | Notes |
|---|---|---|---|---|---|---|
| **Anonymous** | Free | Unlimited creates | 7 days, no recovery | 100 tasks per board | ❌ | Board key access only |
| **Free Team** | Free | 10 active boards | 7 days, no recovery | 500 tasks per board | ❌ | Requires signup |
| **Basic Team** | $10/mo | 500 active boards | Manual delete → 10-day recovery window | Unlimited | ✅ 10 days | Boards in `pending_deletion` state |
| **Premium Team** | TBD | 5000 active boards | Manual delete → 30-day recovery window | Unlimited | ✅ 30 days | Boards in `pending_deletion` state |

### Deletion Lifecycle

- **Active boards** live until auto-deleted (if anonymous or auto-delete enabled) or manually deleted
- Deleted boards move to **`pending_deletion`** state (for paid teams)
- In `pending_deletion`, boards remain accessible for the tier's recovery window
- Users can **eagerly delete** a `pending_deletion` board before the window expires
- After the window, boards are **permanently removed**
- Anonymous and Free Team boards skip `pending_deletion` entirely — deletion is immediate

### Upgrade/Downgrade Policy

- **Upgrading**: New limits apply immediately
- **Downgrading**: Existing boards and their deletion windows are NOT affected. Restrictions apply only to **new** board creation and deletions after the downgrade takes effect
- The UI should prominently display current board count vs. plan limit during downgrade

### Free-Tier Encouragement

- Anonymous boards display their **100-task limit** as a visible counter
- The "Disable auto-delete" option is visible but **disabled** for anonymous users, with a prompt to sign up
- The upgrade/tier management area shows plan benefits clearly

---

## Swim Lanes

Default lanes (in order):

1. **Pending**
2. **In Progress**
3. **Completed**

> Custom swim lanes are out of scope for MVP1–MVP3. Boards always use the three default lanes. We will wait and see if users want custom swim lanes before adding that feature.

---

## MVP Delivery Plan

See [mvp-plan.md](mvp-plan.md) for the full phased delivery plan covering MVP1 (anonymous boards), MVP2 (teams & signup), and MVP3 (billing & paid tiers).
