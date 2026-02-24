# Project Context

## Required Reading

Before contributing to this project, familiarize yourself with the following specification documents:

### Core Documentation
- **`.specs/synopsis.md`** - Project overview and high-level context
- **`.specs/constitution.md`** - Coding standards and git workflow
  - Go and TypeScript/React style guidelines
  - Commit conventions and code quality standards
  - Trunk-based development workflow, branch naming, rebasing, and merge strategies
- **`.specs/specifications.md`** - Detailed feature specifications, requirements, and constraints

### Development Mode
- **`.specs/mvp-plan.md`** - MVP delivery priorities and current focus areas
  - Consult this document to understand which features and components are prioritized
  - Align implementation work with MVP goals

## When to Consult

- **Before implementing features**: Review specifications and MVP plan
- **During code reviews**: Reference constitution for style and workflow standards
- **When writing code**: Follow guidelines in constitution for Go/TypeScript/React
- **For git operations**: Follow branch naming and workflow from constitution

## KB CLI Workflow

This project uses the `kb` CLI utility for task tracking. See **`.github/kb-workflow.md`** for detailed guidance on:
- Creating a board for each feature branch
- Planning tasks at the start of work
- Updating task status during development
- Maintaining board/task IDs for AI agent reference
- Use KB boards extensively to track implementation progress and maintain alignment with specifications.

**Quick workflow**: Create board → Plan tasks → Update status as you work → Reference IDs in commits and PR

## Agent Tools
We have several tools configured in Taskfile.yml for common operations:

- **setup** – Installs dependencies for backend (Go), CLI (Go), and frontend (npm)
- **task up** – Starts Docker containers (docker compose up -d)
- **task down** – Stops Docker containers (docker compose down)
- **task dev** – Runs backend and frontend dev servers concurrently
- **task dev-backend** – Runs backend server (go run ./cmd/server/)
- **task dev-frontend** – Runs frontend dev server (npm run dev)
- **task build** – Builds backend, CLI, and frontend
- **task build-backend** – Compiles backend binary to bin/server.exe
- **task build-cli** – Compiles CLI binaries (kanbin.exe, kb.exe)
- **task build-frontend** – Builds frontend production bundle
- **task install-cli** – Installs CLI globally via go install
- **task test** – Runs all tests
- **task test-backend** – Runs Go backend tests
- **task test-cli** – Runs Go CLI tests
- **task test-frontend** – Runs frontend tests
- **task lint** – Lints all components
- **task lint-backend** – Runs golangci-lint on backend
- **task lint-cli** – Runs golangci-lint on CLI
- **task lint-frontend** – Runs frontend linter
- **task clean** – Removes build artifacts (bin/, frontend/dist/)
- **task release-cli** – Releases CLI using GoReleaser
- **task release-api** – Deploys backend to Fly.io
- **task release-app** – Deploys frontend to Fly.io

# Custom Commands

## /lint
When the user types `/lint`, perform linting for backend, CLI, and frontend by following these steps:

Backend:
Run the linter command `cd backend; golangci-lint run ./...` in the terminal. If the current working directory is not the backend directory, adjust the command accordingly to target the backend codebase.

CLI:
Run the linter command `cd cli; golangci-lint run ./...` in the terminal. If the current working directory is not the CLI directory, adjust the command accordingly to target the CLI codebase.

Frontend:
Run the linter command `cd frontend; npm run lint` in the terminal. If the current working directory is not the frontend directory, adjust the command accordingly to target the frontend codebase.

For all components:
2. Capture the output of the linter.
3. If there are any issues fixed or remaining, provide a summary of the linter output to the user.
4. If no issues are found, respond with "No linting issues found. Your code is clean!"
5. For issues that can be fixed automatically, suggest running the fix command or apply fixes if possible.
6. Run the linter again to ensure all issues are resolved.

## /format
When the user types `/format`, perform formatting for backend, CLI, and frontend by following these steps:

Backend:
Run the formatter command `cd backend; gofmt -w .` in the terminal. If the current working directory is not the backend directory, adjust the command accordingly to target the backend codebase.

CLI:
Run the formatter command `cd cli; gofmt -w .` in the terminal. If the current working directory is not the CLI directory, adjust the command accordingly to target the CLI codebase.

Frontend:
For the frontend, formatting is typically handled by ESLint. Run `cd frontend; npm run lint` to check for formatting issues. If a separate formatter like Prettier is configured, run that command instead.

For all components:
2. Capture the output of the formatter.
3. If there are any files formatted, provide a summary of the formatter output to the user.
4. If no formatting changes are needed, respond with "No formatting changes needed. Your code is already properly formatted!"

## /spec
When the user types `/spec`, perform the following steps:
User need to provide user story description and Task description along with the /spec command (`e.g /spec User story description | Task description`). 
1. Check if the user has provided the user story description and the Task description.
   - If not provided, ask the user to provide both descriptions.
   - If provided, proceed to step 2.
2. User story description will give you a high-level overview of the feature or module to be specified, Task description will give you the specific functionality needs to be build as part of the overall feature.
3. Research the code and develop a detailed specification for the functionality in question, ensuring coding standards are followed.
4. The specification should include:
   - Purpose and goals of the functionality
   - Key requirements and behaviors
   - User interactions and workflows
   - Technical requirements and dependencies
   - Any constraints or considerations
   - Testing and validation criteria including edge cases
5. Present the specification in a clear and organized manner, using bullet points or sections as needed.
6. Ask the user for any additional requirements or clarifications.
7. Breakdown the specification into smaller, manageable tasks or phases. Plan the implementation steps accordingly e.g., each step can be a separate commit or PR and independently testable.
8. Prefer consistency with existing code patterns and architecture in the codebase.
9. Create a markdown file in the `.specs/<short-name-of-the-spec>/` directory with the specification details including the phases and tasks breakdown. The task number should correspond to the work item ID from the branch name if applicable.
10. **VERY IMPORTANT: KB Board Setup**
    - Clear existing `.work-context.md.local` file if it exists to avoid confusion with old boards
    - Check current branch name using `git branch --show-current`
    - Create a KB board using command: `kb board create "<feature-name-from-branch>"`
    - Save the returned Board Key and Board ID
    - Show the board link to user so that they can open it in browser using the url https://kanbin.app/b/<BOARD-KEY> (replace <BOARD-KEY> with the actual key returned from the create command)
    - For each phase/task in the specification, create KB tasks:
      ```bash
      kb task add "Phase 1.1: <task-description>" --board <BOARD-KEY>
      kb task add "Phase 1.2: <task-description>" --board <BOARD-KEY>
      # ... etc
      ```
    - Present the board key and all task IDs to the user
    - MUST save this information in a `.work-context.md.local` file inside the `.specs/<short-name-of-the-spec>/` directory for reference during implementation and PR generation. The file should include:
      ```markdown
      ## Work Context
      **Branch**: <branch-name>
      **Board Key**: <BOARD-KEY>
      **Board ID**: <board-id>
      
      **Tasks**:
      - [ ] Phase 1.1: <description> (TASK-ID-1)
      - [ ] Phase 1.2: <description> (TASK-ID-2)
      ...
      ```

## /implement
When the user types `/implement` followed by a specification file path, implement the specification by following these steps:

**Phase 1: Planning**
1. Read and analyze the provided specification document
2. **Check for KB board context**:
   - Look for `.work-context.md.local` file inside inside the `.specs/<short-name-of-the-spec>/` directory to find Board Key and Task IDs
   - If board exists, load the task list to align implementation with planned tasks
   - If no board exists, suggest creating one (see /spec step 10)
3. Create an implementation plan document named `<spec-name>-implementation-plan.md` in the same directory as the spec
4. Break down the implementation into logical phases and steps:
   - Each phase should represent a cohesive piece of functionality
   - Each step should be independently testable
   - Number steps clearly (e.g., Phase 1.1, 1.2, Phase 2.1, etc.)
   - Mark each step with a status: `[ ]` Not Started, `[~]` In Progress, `[✓]` Completed
   - **Map each step to corresponding KB task ID** if board exists
5. Include in the plan:
   - **KB Board Reference**: Board Key and link to task list (if applicable)
   - **Overview**: High-level summary of what will be implemented
   - **Dependencies**: External services, libraries, or prerequisite work
   - **File Structure**: New files to create and existing files to modify
   - **Implementation Phases**: Detailed breakdown of steps with KB task IDs
   - **Testing Strategy**: Unit tests, integration tests to be created per phase
   - **Success Criteria**: How to verify each phase is complete
6. Present the implementation plan to the user and ask for confirmation before proceeding

**Phase 2: Incremental Implementation**
7. Implement one step at a time, marking it as `[~]` In Progress in the plan
8. Must update the KB board with the current task status for each step:
   - When starting a step, run `kb task move <TASK-ID> --status IN_PROGRESS --board <BOARD-KEY>`
   - When completing a step, run `kb task move <TASK-ID> --status DONE --board <BOARD-KEY>`
   - If KB board exists, update task status: `kb task move <TASK-ID> --status IN_PROGRESS --board <BOARD-KEY>`
   - Remind user which KB task is being worked on
9. After completing each step:
   - Update the plan document to mark the step as `[✓]` Completed
   - Run relevant tests (lint, format, type check, unit tests)
   - Present a summary to the user:
     ```
     ✓ Completed: [Step X.Y - Description]
     KB Task: <TASK-ID> → Done ✓
     
     Changes made:
     - File 1: [brief description]
     - File 2: [brief description]
     
     Tests: [Pass/Fail summary]
     
     Ready to continue with next step: [Step X.Z - Description]
     Press Enter to continue, or type 'pause' to review.
     ```
10. Wait for user acknowledgment before proceeding to the next step
11. If user types 'pause' or 'stop', halt implementation and present:
    ```
    Implementation paused at: [Step X.Y]
    KB Task: <TASK-ID> (in-progress)
    
    Completed steps: [list]
    Remaining steps: [list]
    
    To resume, type: /implement resume
    ```

**Phase 3: Testing & Validation**
10. After completing each phase:
    - Run all relevant tests for that phase
    - Verify success criteria defined in the plan
    - Ask user to manually verify functionality if needed
    - For Go (backend/CLI), use `go test ./...` command
    - For frontend, use `npm run test` command
11. If tests fail:
    - Mark the current step as `[~]` In Progress
    - Fix issues
    - Re-run tests
    - Only mark as `[✓]` when all tests pass

**Phase 4: Completion**
12. After all phases are complete:
    - Verify all KB tasks are marked as `done` (if board exists)
    - Run the full test suite (`/pr-checklist` style validation)
    - Update the implementation plan with final status
    - Generate a summary:
      ```
      🎉 Implementation Complete!
      
      Specification: [spec name]
      Total Phases: [X]
      Total Steps: [Y]
      Files Created: [list]
      Files Modified: [list]
      
      KB Board: <BOARD-KEY> (All X tasks completed ✓)
      
      Next steps:
      - Review the implementation
      - Run manual testing if needed
      - Create PR using /pr command
      ```

**Special Commands:**
- `/implement resume`: Resume paused implementation from the last completed step
- `/implement status`: Show current implementation status without making changes
- `/implement rollback [step]`: Rollback to a specific step (requires git)

**Guidelines:**
- Prefer small, focused commits for each step
- Write tests alongside implementation (not after)
- Follow existing code patterns and architecture
- Keep the implementation plan document updated in real-time
- **Keep KB board synchronized**: Update task status in real-time as work progresses
- **Reference KB task IDs in commits**: Include task ID in commit messages (e.g., "[TASK-A1] Implement filter UI")
- Provide clear, actionable feedback at each step
- Offer to pause if more than 5 consecutive steps have been completed without user interaction
- If encountering errors or uncertainties, pause and ask for clarification
- Use the manage_todo_list tool to track implementation progress
- Maintain `.work-context.md.local` file (inside the `.specs/<short-name-of-the-spec>/` directory) with current board state for easy reference

## /pr
When the user types `/pr`, generate a Pull Request message for merging the current branch into main by following these steps:

1. Get the current branch name using git commands
2. **Check for KB board context**:
   - Look for `.work-context.md.local` file inside the `.specs/<short-name-of-the-spec>/` directory to find Board Key and Task IDs
   - If board exists, run `kb board view <BOARD-KEY>` to get task completion status
   - Include board summary in PR context
3. Get the git diff between main and the current branch using `git diff main...HEAD`
4. Analyze the changes to understand:
   - What files were modified in backend vs CLI vs frontend
   - The nature of the changes (features, fixes, refactoring, etc.)
   - Any new dependencies or configuration changes
5. Execute the `/pr-checklist` command to validate code quality and get checklist results
6. Generate a PR message following the standard PR template structure:

```markdown
## Summary
[Brief description of what this PR does and why]

## KB Board
<!-- If applicable -->
**Board**: <BOARD-KEY>
**Tasks Completed**: X/X ✓

## Key Changes
- Change 1: Description (KB Task: TASK-ID)
- Change 2: Description (KB Task: TASK-ID)
- Change 3: Description (KB Task: TASK-ID)

## Setup
<!-- If applicable, include any environment changes needed -->
[List any new dependencies, environment variables, or configuration changes]

## Checklist
[Use the actual results from /pr-checklist execution to populate this section with ✅/❌/⚠️ status]

- [✅/❌] Linting passes
  - Backend: [status and summary]
  - CLI: [status and summary]
  - Frontend: [status and summary]
- [✅/❌] Formatting passes
  - Backend: [status and summary]
  - CLI: [status and summary]
  - Frontend: [status and summary]
- [✅/⚠️/❌] Type checking passes
  - Backend: [status and summary]
  - CLI: [status and summary]
  - Frontend: [status and summary]
- [✅/❌] Test cases passing
  - Backend: [X tests passed/failed]
  - CLI: [X tests passed/failed]
  - Frontend: [X tests passed/failed]
- [ ] Code in working condition
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated (if applicable)
- [ ] Pre-commit hooks installed and passing
```

7. Generate a concise PR message limited to **3000 characters maximum**:
   - Prioritize: Summary, Key Changes (top 5-7 items), Setup (if needed), Checklist results
   - Use brief bullet points and avoid verbose descriptions
   - Omit detailed specifications, file lists, or extensive notes if space is limited
   - Focus on actionable information and test results
8. Save the generated PR message to `pr-message.txt.local` file
9. Copy the file contents to clipboard using PowerShell command: `Get-Content pr-message.txt.local | Set-Clipboard`
10. Inform the user about:
    - The PR message has been generated and saved to `pr-message.txt.local`
    - The content has been copied to clipboard
    - Summary of the checklist results (overall pass/fail status)

## /pr-checklist
When the user types `/pr-checklist`, execute the PR checklist to verify code quality before merging by following these steps:

1. Create a todo list to track the checklist execution
2. Execute each checklist item in sequence. If the current working directory is not the relevant directory, adjust commands accordingly e.g., change directory to the backend or frontend directory:
   
   **Branch Naming Validation:**
   - Get current branch name using `git branch --show-current`
   - Verify branch follows naming convention: `feature|bugfix|hotfix/<short-name>`
   - Example valid names: `feature/add-calculator`, `bugfix/fix-auth`
   - Result: [✅ Valid branch name / ⚠️ Non-standard but acceptable / ❌ Invalid branch name]
   
   **Linting:**
   - Backend: Run `cd backend; golangci-lint run ./...` 
   - CLI: Run `cd cli; golangci-lint run ./...`
   - Frontend: Run `cd frontend; npm run lint`
   
   **Formatting:**
   - Backend: Run `cd backend; gofmt -l .` (lists unformatted files; if any, run `gofmt -w .`)
   - CLI: Run `cd cli; gofmt -l .` (lists unformatted files; if any, run `gofmt -w .`)
   - Frontend: Check via linting or run formatter if configured separately
   
   **Type Checking:**
   - Backend: Go has static typing; check via `cd backend; go build ./...`
   - CLI: Go has static typing; check via `cd cli; go build ./...`
   - Frontend: Run `cd frontend; npm run build` (includes TypeScript compilation)
   
   **Tests:**
   - Backend: Run `cd backend; go test ./...`
   - CLI: Run `cd cli; go test ./...`
   - Frontend: Run `cd frontend; npm run test`
   
   **Code Coverage:**
   - Backend: Run `cd backend; go test -cover ./...` 
   - CLI: Run `cd cli; go test -cover ./...`
   - Frontend: Run `cd frontend; npm run test` with coverage flags if configured
   - Check coverage meets 80%+ threshold where applicable
   - Result: [✅ Coverage ≥80% / ⚠️ Coverage 70-79% / ❌ Coverage <70%]
   
   **Pre-commit Hooks:**
   - Run `pre-commit run --all-files` (or check if .git/hooks/pre-commit exists)
   - Verify all hooks pass
   - Result: [✅ Hooks installed and passing / ⚠️ Hooks not installed / ❌ Hooks failing]
   
   **Environment Changes Detection:**
   - Get the git diff using `git diff main...HEAD`
   - Check for changes in:
     - `go.mod` files in backend/cli (new Go dependencies)
     - `package.json` in frontend (new npm dependencies)
     - `.env.example`, `backend/.env.example`, or `frontend/.env.example` (new environment variables)
   - If changes detected, verify they are documented in:
     - README.md (setup instructions)
     - PR description should mention these changes
   - Result: [✅ No env changes / ✅ Env changes documented / ⚠️ Env changes need documentation]
   
   **Documentation Verification:**
   - Get the git diff using `git diff main...HEAD`
   - Check if there's a relevant spec file in `.specs/` directory that relates to the changes
   - Analyze the diff to determine if documentation updates are needed:
     - New features → README.md, API_DOCS.md, or feature-specific docs should be updated
     - API changes → API_DOCS.md should reflect new/modified endpoints
     - Configuration changes → README.md setup/configuration sections should be updated
     - New components/hooks (frontend) → Component documentation or usage examples
     - New services/utilities (backend) → Code comments and/or API_DOCS.md
   - Check if documentation files (README.md, API_DOCS.md, docs/*) have been modified appropriately
   - If spec exists, verify that implementation aligns with spec and all documented features are covered in updated docs
   - Result: [✅ Docs updated appropriately / ⚠️ Docs may need updates / ❌ Docs missing for significant changes]

3. Mark each todo item as completed after successful execution
4. Collect results and present a summary to the user:

```markdown
## PR Checklist Results

### Branch & Work Item
- Branch naming: [✅/⚠️/❌] [branch name and validation result]
- Work item linked: [✅/⚠️] [AB#XXXX or warning if not found]

### Linting
- Backend: [✅/❌] [summary]
- CLI: [✅/❌] [summary]
- Frontend: [✅/❌] [summary]

### Formatting
- Backend: [✅/❌] [summary]
- CLI: [✅/❌] [summary]
- Frontend: [✅/❌] [summary]

### Type Checking
- Backend: [✅/⚠️/❌] [summary]
- CLI: [✅/⚠️/❌] [summary]
- Frontend: [✅/❌] [summary]

### Tests
- Backend: [✅/❌] [X tests passed/failed]
- CLI: [✅/❌] [X tests passed/failed]
- Frontend: [✅/❌] [X tests passed/failed]

### Code Coverage
- Backend: [✅/⚠️/❌] [X% coverage]
- CLI: [✅/⚠️/❌] [X% coverage]
- Frontend: [✅/⚠️/❌] [X% coverage]

### Pre-commit Hooks
[✅/⚠️/❌] [status and summary]

### Environment Changes
[✅/⚠️] [summary of dependency or env var changes and documentation status]

### Documentation
[✅/⚠️/❌] [summary of documentation status]
- Modified docs: [list of doc files changed]
- Recommendations: [what should be updated, if anything]

### Overall Status
[✅ All checks passed! PR is ready to merge / ❌ Some checks failed, please review]
```

5. If any checks fail, provide specific details about the failures and suggest fixes
6. Note: Go's static type checking is done at compile time; build errors indicate type issues

5. If any checks fail, provide specific details about the failures and suggest fixes
6. Note: Backend mypy may show type stub warnings with strict config - these are expected and don't affect runtime