import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import './Landing.css';

export default function Landing() {
  const navbarRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const [boardName, setBoardName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Navbar scroll morph
  useEffect(() => {
    const navbar = navbarRef.current;
    const hero = heroRef.current;
    if (!navbar || !hero) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navbar.classList.remove('scrolled');
          } else {
            navbar.classList.add('scrolled');
          }
        });
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Scroll reveal
  useEffect(() => {
    const targets = document.querySelectorAll(
      '.landing .endpoint, .landing .qs-card, .landing .cli-cmd, .landing .model-card, .landing .arch-card, .landing .principle, .landing .use-case, .landing .selfhost-step'
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const parent = entry.target.parentElement;
            if (parent) {
              const siblings = Array.from(parent.children);
              const index = siblings.indexOf(entry.target as Element);
              (entry.target as HTMLElement).style.transitionDelay = `${index * 0.06}s`;
            }
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleToggle = useCallback(() => {
    const menu = menuRef.current;
    const toggle = toggleRef.current;
    if (!menu || !toggle) return;
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('open');
  }, []);

  const closeMenu = useCallback(() => {
    menuRef.current?.classList.remove('open');
    toggleRef.current?.setAttribute('aria-expanded', 'false');
  }, []);

  const handleCreateBoard = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const title = boardName.trim();
    if (!title) return;

    setCreating(true);
    setError('');
    try {
      const board = await api.createBoard(title);
      navigate(`/b/${board.key}`);
    } catch {
      setError('Failed to create board. Please try again.');
      setCreating(false);
    }
  }, [boardName, navigate]);

  return (
    <div className="landing">

      {/* ── NAVBAR ── */}
      <nav ref={navbarRef} className="l-navbar" aria-label="Primary navigation">
        <div className="nav-inner">
          <a href="#" className="nav-brand" aria-label="Kanbin home">kanbin<span className="accent">_</span></a>
          <div ref={menuRef} className="nav-links">
            <a href="#quickstart" onClick={closeMenu}>quickstart</a>
            <a href="#api" onClick={closeMenu}>api</a>
            <a href="#cli" onClick={closeMenu}>cli</a>
            <a href="#self-hosting" onClick={closeMenu}>self-hosting</a>
            <a href="#philosophy" onClick={closeMenu}>philosophy</a>
            <a href="https://github.com/zeeshanejaz/kanbin" className="nav-cta" target="_blank" rel="noopener">GitHub →</a>
          </div>
          <button ref={toggleRef} className="nav-toggle" aria-label="Toggle menu" aria-expanded="false" onClick={handleToggle}>
            <span></span><span></span>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header ref={heroRef} className="l-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Ephemeral Kanban for the agentic era</p>
          <h1>
            <span className="hero-sans">Show your work</span><br />
            <span className="hero-serif">to your humans.</span>
          </h1>
          <p className="hero-sub">
            Disposable Kanban boards with a REST API, CLI, and web UI.<br />
            No signup. No configuration. Boards expire in 7 days.<br />
            Built for AI agents. Readable by humans.
          </p>
          <div className="hero-actions">
            <form className="hero-create-form" onSubmit={handleCreateBoard}>
              <div className="hero-input-group">
                <input
                  type="text"
                  className="hero-input"
                  placeholder="sprint-42"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  disabled={creating}
                  maxLength={64}
                  aria-label="Board name"
                />
                <button
                  type="submit"
                  className="l-btn l-btn-accent hero-create-btn"
                  disabled={creating || !boardName.trim()}
                >
                  {creating ? 'Creating…' : 'Create Board →'}
                </button>
              </div>
              {error && <p className="hero-error">{error}</p>}
            </form>
          </div>
          <div className="hero-divider"><span className="mono">or via API</span></div>
          <pre className="hero-curl"><code>{`curl -X POST https://kanbin.app/api/boards \\
  -H "Content-Type: application/json" \\
  -d '{"title": "sprint-42"}'`}</code></pre>
          <p className="hero-hint mono">No signup required — boards expire in 7 days</p>
        </div>
        <div className="hero-status">
          <span className="status-dot"></span>
          <span className="mono">v1.0.0 — system operational</span>
        </div>
      </header>

      <main>

        {/* ── USE CASES ── */}
        <section id="use-cases" className="l-section-dark l-section-usecases">
          <div className="section-header">
            <span className="section-label mono">00</span>
            <h2>The Problem</h2>
          </div>

          <div className="usecases-intro">
            <p className="usecases-lede">
              Your agents are shipping code at machine speed.<br />
              <span className="accent-text">You can't read fast enough.</span>
            </p>
            <p className="usecases-sub">
              Thought tokens vanish in milliseconds. Console output scrolls past before your eyes can focus.
              Three agents refactoring the same service, and all you see is a wall of text moving at 200 lines per second.
              You didn't lose control — you never had visibility in the first place.
            </p>
          </div>

          <div className="usecases-grid">
            <article className="use-case">
              <div className="usecase-icon mono">[01]</div>
              <h3>Multi-agent code sprints</h3>
              <p>
                Four agents tearing through a monolith migration — modules decomposed, tests rewritten,
                APIs versioned — all in parallel. The terminal becomes noise. A Kanbin board becomes
                a live war room: what's done, what's in flight, what's blocked. Glance at it. Breathe.
              </p>
            </article>

            <article className="use-case">
              <div className="usecase-icon mono">[02]</div>
              <h3>Autonomous CI/CD pipelines</h3>
              <p>
                Your deployment agent runs 14 steps: lint, test, build, scan, provision, migrate, deploy,
                smoke-test, rollback-check… You get a Slack message saying "done" — but <em>which</em> steps
                ran? A board gives each step a card. Watch them flip from TODO to DONE in real time.
              </p>
            </article>

            <article className="use-case">
              <div className="usecase-icon mono">[03]</div>
              <h3>Research &amp; retrieval agents</h3>
              <p>
                A RAG agent crawling documentation, indexing endpoints, summarizing changelogs.
                Thousands of thought tokens spent reasoning about what to fetch next — invisible to you.
                Give it a board. Now you see the agent <em>thinking</em>, not just the final answer.
              </p>
            </article>

            <article className="use-case">
              <div className="usecase-icon mono">[04]</div>
              <h3>Human-in-the-loop checkpoints</h3>
              <p>
                Not every decision should be autonomous. When an agent hits a judgment call — delete
                the legacy table? merge the conflicting schema? — it creates a task and waits. You see
                it on the board. You decide. The agent resumes. Supervision without the surveillance.
              </p>
            </article>

            <article className="use-case">
              <div className="usecase-icon mono">[05]</div>
              <h3>Hackathons &amp; throwaway sprints</h3>
              <p>
                48-hour build. No time to configure Jira. No patience for Linear onboarding.
                POST a board, hand the key to your team (or your agents), and start shipping.
                When the weekend's over, the board expires. Zero cleanup. Zero guilt.
              </p>
            </article>

            <article className="use-case">
              <div className="usecase-icon mono">[06]</div>
              <h3>Teaching agents accountability</h3>
              <p>
                System prompt: "Before you write code, create a task. Before you move on, mark it done."
                Now every agent interaction produces a visible artifact. You stop asking "what did you do?"
                and start watching work move across columns — like it should.
              </p>
            </article>
          </div>
        </section>

        {/* ── QUICKSTART ── */}
        <section id="quickstart" className="l-section">
          <div className="section-header">
            <span className="section-label mono">01</span>
            <h2>Quickstart</h2>
          </div>

          <div className="quickstart-grid">
            <article className="qs-card">
              <h3>Via REST API</h3>
              <p>Create a board and add tasks with plain HTTP. No auth required.</p>
              <pre><code>{`# 1. Create a board
curl -s -X POST https://kanbin.app/api/boards \\
  -H "Content-Type: application/json" \\
  -d '{"title": "my-sprint"}' | jq

# Response:
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "key": "a1b2c3d4",
#   "title": "my-sprint",
#   "created_at": "2026-02-22T10:00:00Z",
#   "expires_at": "2026-03-01T10:00:00Z"
# }

# 2. Add a task
curl -s -X POST https://kanbin.app/api/boards/a1b2c3d4/tasks \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Implement auth", "status": "TODO"}'

# 3. Move task to IN_PROGRESS
curl -s -X PUT https://kanbin.app/api/tasks/{task-id} \\
  -H "Content-Type: application/json" \\
  -d '{"status": "IN_PROGRESS"}'

# 4. View the board
curl -s https://kanbin.app/api/boards/a1b2c3d4 | jq`}</code></pre>
            </article>

            <article className="qs-card">
              <h3>Via CLI</h3>
              <p>Install the <code>kb</code> binary and manage boards from your terminal or CI pipeline.</p>
              <pre><code>{`# Install (Go required)
go install github.com/zeeshanejaz/kanbin/cli/cmd/kanbin@latest

# Create a board
kb board create "weekend-hack"
# → Board created!
# → Title: weekend-hack
# → Key:   f9e8d7c6

# Add tasks
kb task add "Setup CI" --board f9e8d7c6
kb task add "Write tests" --board f9e8d7c6
kb task add "Deploy" --board f9e8d7c6

# Move a task
kb task move {task-id} --status IN_PROGRESS

# View the board
kb board view f9e8d7c6
# → === weekend-hack [f9e8d7c6] ===
# → ID        | STATUS      | TITLE
# → ----------------------------------------
# → a1b2...   | TODO        | Setup CI
# → c3d4...   | IN_PROGRESS | Write tests
# → e5f6...   | TODO        | Deploy`}</code></pre>
            </article>

            <article className="qs-card qs-card-wide">
              <h3>For AI Agents</h3>
              <p>Give your agent a board key. It posts progress as it works. You watch.</p>
              <pre><code>{`# Agent system prompt snippet:
You have access to a Kanbin board at https://kanbin.app/api/boards/a1b2c3d4
Use it to track your progress. Available statuses: TODO, IN_PROGRESS, DONE

POST /api/boards/{key}/tasks   → Create a task
PUT  /api/tasks/{id}            → Update status, title, description, position
GET  /api/boards/{key}          → View all tasks on the board

# The human opens the board URL in a browser and sees
# the agent's progress in real time. No polling needed
# with ETag support for efficient cache validation.`}</code></pre>
            </article>
          </div>
        </section>

        {/* ── API REFERENCE ── */}
        <section id="api" className="l-section l-section-api">
          <div className="section-header">
            <span className="section-label mono">02</span>
            <h2>API Reference</h2>
          </div>
          <p className="section-desc">
            Base URL: <code>https://kanbin.app/api</code> —
            All responses are <code>application/json</code>.
            No authentication required for anonymous boards.
          </p>

          {/* Health */}
          <article className="endpoint">
            <div className="endpoint-header">
              <span className="method method-get">GET</span>
              <code className="endpoint-path">/api/health</code>
            </div>
            <p>Service health check.</p>
            <details>
              <summary>Response <code>200</code></summary>
              <pre><code>{`{
  "status": "ok",
  "message": "Kanbin API is live",
  "version": "1.0.0"
}`}</code></pre>
            </details>
          </article>

          {/* Create Board */}
          <article className="endpoint">
            <div className="endpoint-header">
              <span className="method method-post">POST</span>
              <code className="endpoint-path">/api/boards</code>
            </div>
            <p>Create a new board. Returns a unique <code>key</code> for sharing. Board expires in 7 days.</p>
            <details>
              <summary>Request body</summary>
              <pre><code>{`{
  "title": "string"  // required — board name
}`}</code></pre>
            </details>
            <details>
              <summary>Response <code>201</code></summary>
              <pre><code>{`{
  "id": "uuid",
  "key": "a1b2c3d4",        // 8-char hex key — use this to share
  "title": "my-sprint",
  "created_at": "2026-02-22T10:00:00Z",
  "expires_at": "2026-03-01T10:00:00Z"
}`}</code></pre>
            </details>
          </article>

          {/* Get Board */}
          <article className="endpoint">
            <div className="endpoint-header">
              <span className="method method-get">GET</span>
              <code className="endpoint-path">/api/boards/&#123;key&#125;</code>
            </div>
            <p>
              Retrieve a board and all its tasks. Supports <code>ETag</code> /
              <code>If-None-Match</code> for cache validation — returns <code>304</code> if unchanged.
              Returns <code>410 Gone</code> if the board has expired.
            </p>
            <details>
              <summary>Response <code>200</code></summary>
              <pre><code>{`{
  "id": "uuid",
  "key": "a1b2c3d4",
  "title": "my-sprint",
  "created_at": "2026-02-22T10:00:00Z",
  "expires_at": "2026-03-01T10:00:00Z",
  "tasks": [
    {
      "id": "uuid",
      "board_id": "uuid",
      "title": "Implement auth",
      "description": "",
      "status": "TODO",
      "position": 0,
      "created_at": "2026-02-22T10:01:00Z",
      "updated_at": "2026-02-22T10:01:00Z"
    }
  ]
}`}</code></pre>
            </details>
            <details>
              <summary>Headers</summary>
              <pre><code>{`ETag: "etag-value"

# Conditional request:
If-None-Match: "etag-value"  →  304 Not Modified`}</code></pre>
            </details>
          </article>

          {/* Search Boards */}
          <article className="endpoint">
            <div className="endpoint-header">
              <span className="method method-get">GET</span>
              <code className="endpoint-path">/api/boards?q=&#123;query&#125;</code>
            </div>
            <p>Search boards by title. Returns an empty array if no query is provided.</p>
            <details>
              <summary>Response <code>200</code></summary>
              <pre><code>{`[
  {
    "id": "uuid",
    "key": "a1b2c3d4",
    "title": "my-sprint",
    "created_at": "...",
    "expires_at": "..."
  }
]`}</code></pre>
            </details>
          </article>

          {/* Delete Board */}
          <article className="endpoint">
            <div className="endpoint-header">
              <span className="method method-delete">DELETE</span>
              <code className="endpoint-path">/api/boards/&#123;key&#125;</code>
            </div>
            <p>Delete a board and all its tasks.</p>
            <details>
              <summary>Response <code>200</code></summary>
              <pre><code>{`{"message": "deleted"}`}</code></pre>
            </details>
          </article>

          <hr className="divider" />

          {/* Create Task */}
          <article className="endpoint">
            <div className="endpoint-header">
              <span className="method method-post">POST</span>
              <code className="endpoint-path">/api/boards/&#123;key&#125;/tasks</code>
            </div>
            <p>
              Add a task to a board. Maximum <strong>100 tasks</strong> per board.
              If <code>status</code> is omitted, defaults to <code>TODO</code>.
            </p>
            <details>
              <summary>Request body</summary>
              <pre><code>{`{
  "title": "string",          // required
  "description": "string",    // optional
  "status": "TODO"            // optional — TODO | IN_PROGRESS | DONE
}`}</code></pre>
            </details>
            <details>
              <summary>Response <code>201</code></summary>
              <pre><code>{`{
  "id": "uuid",
  "board_id": "uuid",
  "title": "Implement auth",
  "description": "",
  "status": "TODO",
  "position": 0,
  "created_at": "2026-02-22T10:01:00Z",
  "updated_at": "2026-02-22T10:01:00Z"
}`}</code></pre>
            </details>
            <details>
              <summary>Error <code>422</code></summary>
              <pre><code>{`{"error": "Task limit reached (100)"}`}</code></pre>
            </details>
          </article>

          {/* Update Task */}
          <article className="endpoint">
            <div className="endpoint-header">
              <span className="method method-put">PUT</span>
              <code className="endpoint-path">/api/tasks/&#123;id&#125;</code>
            </div>
            <p>
              Partial update. Send only the fields you want to change.
              Accepts <code>title</code>, <code>description</code>, <code>status</code>, <code>position</code>.
            </p>
            <details>
              <summary>Request body (all fields optional)</summary>
              <pre><code>{`{
  "title": "string",
  "description": "string",
  "status": "IN_PROGRESS",    // TODO | IN_PROGRESS | DONE
  "position": 2               // integer — sort order
}`}</code></pre>
            </details>
            <details>
              <summary>Response <code>200</code></summary>
              <pre><code>{`{
  "id": "uuid",
  "board_id": "uuid",
  "title": "Implement auth",
  "description": "Add JWT middleware",
  "status": "IN_PROGRESS",
  "position": 0,
  "created_at": "2026-02-22T10:01:00Z",
  "updated_at": "2026-02-22T10:05:00Z"
}`}</code></pre>
            </details>
          </article>

          {/* Delete Task */}
          <article className="endpoint">
            <div className="endpoint-header">
              <span className="method method-delete">DELETE</span>
              <code className="endpoint-path">/api/tasks/&#123;id&#125;</code>
            </div>
            <p>Delete a single task by UUID.</p>
            <details>
              <summary>Response <code>200</code></summary>
              <pre><code>{`{"message": "deleted"}`}</code></pre>
            </details>
          </article>

          {/* Error format */}
          <article className="endpoint endpoint-note">
            <h3>Error Format</h3>
            <p>All errors return a JSON object with a single <code>error</code> key:</p>
            <pre><code>{`{"error": "Board not found"}        // 404
{"error": "Board has expired"}      // 410
{"error": "Invalid request body"}   // 400
{"error": "Invalid task ID format"} // 400
{"error": "Task limit reached (100)"} // 422`}</code></pre>
          </article>
        </section>

        {/* ── CLI REFERENCE ── */}
        <section id="cli" className="l-section">
          <div className="section-header">
            <span className="section-label mono">03</span>
            <h2>CLI Reference</h2>
          </div>
          <p className="section-desc">
            The <code>kb</code> CLI wraps the REST API for terminal and CI/CD use.
            Install with Go or download a binary from releases.<br />
            Set <code>KANBIN_URL</code> or use <code>--server</code> to override the default endpoint.
          </p>

          <div className="cli-grid">
            <article className="cli-cmd">
              <h3 className="mono">kb board create &lt;title&gt;</h3>
              <p>Create a new board. Prints the board key for sharing.</p>
              <pre><code>{`$ kb board create "deploy-pipeline"
Board created successfully!
Title: deploy-pipeline
Key:   f9e8d7c6`}</code></pre>
            </article>

            <article className="cli-cmd">
              <h3 className="mono">kb board view &lt;key&gt;</h3>
              <p>Display a board with all tasks in a table format.</p>
              <pre><code>{`$ kb board view f9e8d7c6
=== deploy-pipeline [f9e8d7c6] ===

ID        | STATUS      | TITLE        | DESCRIPTION
------------------------------------------------
a1b2...   | TODO        | Setup CI     |
c3d4...   | IN_PROGRESS | Write tests  |
e5f6...   | DONE        | Deploy       |`}</code></pre>
            </article>

            <article className="cli-cmd">
              <h3 className="mono">kb board delete &lt;key&gt;</h3>
              <p>Delete a board and all its tasks.</p>
              <pre><code>{`$ kb board delete f9e8d7c6
Board f9e8d7c6 deleted successfully.`}</code></pre>
            </article>

            <article className="cli-cmd">
              <h3 className="mono">kb task add &lt;title&gt; --board &lt;key&gt;</h3>
              <p>Add a task to a board. Defaults to <code>TODO</code> status.</p>
              <pre><code>{`$ kb task add "Run migrations" --board f9e8d7c6
Task [a1b2c3d4-...] added: Run migrations`}</code></pre>
            </article>

            <article className="cli-cmd">
              <h3 className="mono">kb task move &lt;id&gt; --status &lt;STATUS&gt;</h3>
              <p>Change a task's status. Values: <code>TODO</code>, <code>IN_PROGRESS</code>, <code>DONE</code>.</p>
              <pre><code>{`$ kb task move a1b2c3d4-... --status DONE
Task a1b2c3d4-... moved to DONE`}</code></pre>
            </article>

            <article className="cli-cmd">
              <h3 className="mono">kb task list --board &lt;key&gt;</h3>
              <p>List all tasks on a board, one per line.</p>
              <pre><code>{`$ kb task list --board f9e8d7c6
[TODO]        a1b2... | Run migrations
[IN_PROGRESS] c3d4... | Write tests
[DONE]        e5f6... | Deploy`}</code></pre>
            </article>

            <article className="cli-cmd">
              <h3 className="mono">kb task delete &lt;id&gt;</h3>
              <p>Delete a single task by ID.</p>
              <pre><code>{`$ kb task delete a1b2c3d4-...
Task a1b2c3d4-... deleted.`}</code></pre>
            </article>

            <article className="cli-cmd">
              <h3 className="mono">Global Flags</h3>
              <table className="flags-table">
                <thead>
                  <tr><th>Flag</th><th>Env</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>--server, -s</code></td><td><code>KANBIN_URL</code></td><td>Override base API URL</td></tr>
                </tbody>
              </table>
            </article>
          </div>
        </section>

        {/* ── DATA MODELS ── */}
        <section id="models" className="l-section">
          <div className="section-header">
            <span className="section-label mono">04</span>
            <h2>Data Models</h2>
          </div>

          <div className="models-grid">
            <article className="model-card">
              <h3>Board</h3>
              <table className="model-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>id</code></td><td><code>uuid</code></td><td>Unique identifier</td></tr>
                  <tr><td><code>key</code></td><td><code>string</code></td><td>8-char hex slug for sharing</td></tr>
                  <tr><td><code>title</code></td><td><code>string</code></td><td>Board name</td></tr>
                  <tr><td><code>created_at</code></td><td><code>datetime</code></td><td>ISO 8601 creation timestamp</td></tr>
                  <tr><td><code>expires_at</code></td><td><code>datetime</code></td><td>Auto-expiry, default +7 days</td></tr>
                </tbody>
              </table>
              <pre><code>{`// JSON representation
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "a1b2c3d4",
  "title": "my-sprint",
  "created_at": "2026-02-22T10:00:00Z",
  "expires_at": "2026-03-01T10:00:00Z"
}`}</code></pre>
            </article>

            <article className="model-card">
              <h3>Task</h3>
              <table className="model-table">
                <thead>
                  <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>id</code></td><td><code>uuid</code></td><td>Unique identifier</td></tr>
                  <tr><td><code>board_id</code></td><td><code>uuid</code></td><td>Parent board reference</td></tr>
                  <tr><td><code>title</code></td><td><code>string</code></td><td>Task name</td></tr>
                  <tr><td><code>description</code></td><td><code>string</code></td><td>Optional details</td></tr>
                  <tr><td><code>status</code></td><td><code>enum</code></td><td><code>TODO</code> · <code>IN_PROGRESS</code> · <code>DONE</code></td></tr>
                  <tr><td><code>position</code></td><td><code>int</code></td><td>Sort order within status column</td></tr>
                  <tr><td><code>created_at</code></td><td><code>datetime</code></td><td>ISO 8601 creation timestamp</td></tr>
                  <tr><td><code>updated_at</code></td><td><code>datetime</code></td><td>ISO 8601 last modification</td></tr>
                </tbody>
              </table>
              <pre><code>{`// JSON representation
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "board_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Implement auth",
  "description": "Add JWT middleware",
  "status": "IN_PROGRESS",
  "position": 0,
  "created_at": "2026-02-22T10:01:00Z",
  "updated_at": "2026-02-22T10:05:00Z"
}`}</code></pre>
            </article>

            <article className="model-card">
              <h3>TaskStatus Enum</h3>
              <table className="model-table">
                <thead>
                  <tr><th>Value</th><th>Meaning</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>TODO</code></td><td>Not started — default for new tasks</td></tr>
                  <tr><td><code>IN_PROGRESS</code></td><td>Currently being worked on</td></tr>
                  <tr><td><code>DONE</code></td><td>Completed</td></tr>
                </tbody>
              </table>
            </article>
          </div>
        </section>

        {/* ── PHILOSOPHY ── */}
        <section id="philosophy" className="l-section-dark">
          <div className="section-header">
            <span className="section-label mono">05</span>
            <h2>Philosophy</h2>
          </div>

          <div className="philosophy-text">
            <p className="philosophy-contrast">
              Most project tools assume you want <em>permanence</em>.
            </p>
            <p className="philosophy-statement">
              We assume you want<br />
              <span className="accent-text">disposability.</span>
            </p>
          </div>

          <div className="principles-grid">
            <article className="principle">
              <h3 className="mono">Ephemeral by default</h3>
              <p>Boards expire after 7 days. No clutter, no cleanup, no legacy debt. Create, use, forget.</p>
            </article>
            <article className="principle">
              <h3 className="mono">Zero friction entry</h3>
              <p>No account needed. No OAuth flow. No email verification. POST to create, GET to read. That's it.</p>
            </article>
            <article className="principle">
              <h3 className="mono">Agent-first design</h3>
              <p>The API and CLI are primary interfaces. The web UI exists for human observers. Machines create; humans monitor.</p>
            </article>
            <article className="principle">
              <h3 className="mono">Minimal surface area</h3>
              <p>Boards have tasks. Tasks have statuses. That's the entire data model. No labels, no sprints, no story points, no swimlane customization.</p>
            </article>
          </div>
        </section>

        {/* ── ARCHITECTURE ── */}
        <section id="architecture" className="l-section">
          <div className="section-header">
            <span className="section-label mono">06</span>
            <h2>Architecture</h2>
          </div>

          <div className="arch-grid">
            <article className="arch-card">
              <div className="arch-icon mono">[BE]</div>
              <h3>Backend</h3>
              <p>Go + Chi router. PostgreSQL storage. Stateless REST API. Deployed on Fly.io. Handles board lifecycle, task CRUD, ETags, and auto-expiry.</p>
              <ul className="arch-stack mono">
                <li>Go 1.22+</li>
                <li>Chi v5</li>
                <li>PostgreSQL</li>
                <li>Fly.io</li>
              </ul>
            </article>
            <article className="arch-card">
              <div className="arch-icon mono">[FE]</div>
              <h3>Frontend</h3>
              <p>React + TypeScript + Vite. Drag-and-drop Kanban UI. Real-time board view with ETag-based polling. Deployed as static assets behind Nginx.</p>
              <ul className="arch-stack mono">
                <li>React 19</li>
                <li>TypeScript</li>
                <li>Vite</li>
                <li>TanStack Query</li>
              </ul>
            </article>
            <article className="arch-card">
              <div className="arch-icon mono">[CLI]</div>
              <h3>CLI</h3>
              <p>Go binary using Cobra. Wraps the REST API for terminal use. Perfect for shell scripts, CI pipelines, and agent system prompts.</p>
              <ul className="arch-stack mono">
                <li>Go 1.22+</li>
                <li>Cobra</li>
                <li>Single binary</li>
                <li>Cross-platform</li>
              </ul>
            </article>
          </div>
        </section>

        {/* ── SELF-HOSTING ── */}
        <section id="self-hosting" className="l-section">
          <div className="section-header">
            <span className="section-label mono">07</span>
            <h2>Self-Hosting</h2>
          </div>
          <p className="selfhost-intro">
            Run your own Kanbin instance in minutes — database, backend, and frontend all in one command.
          </p>

          <div className="selfhost-grid">
            <div className="selfhost-step">
              <div className="selfhost-num mono">01</div>
              <h3>Start everything</h3>
              <p>Clone the repo and bring up the full stack with Docker Compose. Postgres, backend API, and the web UI all start together.</p>
              <pre className="selfhost-code"><code>{`git clone https://github.com/zeeshanejaz/kanbin
cd kanbin
docker compose up -d`}</code></pre>
              <p className="selfhost-note mono">Web UI → <strong>:3000</strong> · API → <strong>:8080</strong> · DB → <strong>:5432</strong></p>
            </div>

            <div className="selfhost-step">
              <div className="selfhost-num mono">02</div>
              <h3>Open the board</h3>
              <p>Navigate to your instance in the browser. The frontend proxies all <code>/api/</code> requests to the backend container automatically — no CORS config needed.</p>
              <pre className="selfhost-code"><code>{`open http://localhost:3000`}</code></pre>
              <p className="selfhost-note mono">Nginx handles the <code>/api/</code> → backend proxy internally.</p>
            </div>

            <div className="selfhost-step">
              <div className="selfhost-num mono">03</div>
              <h3>Point the CLI at your instance</h3>
              <p>Use the <code>--server</code> flag or set <code>KANBIN_URL</code> once for the session.</p>
              <pre className="selfhost-code"><code>{`# one-off
kanbin --server http://localhost:8080 board list

# or export once
export KANBIN_URL=http://localhost:8080
kanbin board create "my-sprint"
kanbin task add <board-key> "Fix auth bug"`}</code></pre>
              <p className="selfhost-note mono"><code>--server</code> overrides <code>KANBIN_URL</code> which overrides the built-in default.</p>
            </div>
          </div>

          <div className="selfhost-requirements">
            <h4 className="mono">Requirements</h4>
            <div className="selfhost-req-grid">
              <div className="selfhost-req"><span className="mono req-label">Docker</span><span>with Compose v2</span></div>
              <div className="selfhost-req"><span className="mono req-label">Go</span><span>1.22+ (CLI only)</span></div>
              <div className="selfhost-req"><span className="mono req-label">Ports</span><span>3000 · 8080 · 5432</span></div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="l-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">kanbin<span className="accent">_</span></span>
            <p className="footer-tagline">Ephemeral Kanban for the agentic era.</p>
          </div>
          <div className="footer-col">
            <h4>Docs</h4>
            <a href="#quickstart">Quickstart</a>
            <a href="#api">API Reference</a>
            <a href="#cli">CLI Reference</a>
            <a href="#models">Data Models</a>
          </div>
          <div className="footer-col">
            <h4>Project</h4>
            <a href="https://github.com/zeeshanejaz/kanbin" target="_blank" rel="noopener">GitHub</a>
            <a href="#philosophy">Philosophy</a>
            <a href="#architecture">Architecture</a>
            <a href="#self-hosting">Self-Hosting</a>
          </div>
          <div className="footer-status">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="mono">System Operational</span>
            </div>
            <span className="mono footer-version">v1.0.0</span>
          </div>
        </div>
        <div className="footer-legal mono">
          <span>© 2026 Kanbin</span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
