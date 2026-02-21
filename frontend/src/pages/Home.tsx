import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Home() {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const navigate = useNavigate();

    const features = [
        {
            icon: '⚡',
            title: 'Zero Friction',
            description: 'No signup, no login, just create and share. Start working in seconds.'
        },
        {
            icon: '⏰',
            title: 'Auto-Expiring',
            description: 'Boards expire after 7 days. Perfect for short-lived work that doesn\'t need to live forever.'
        },
        {
            icon: '🤖',
            title: 'Agent-First',
            description: 'CLI and REST API are first-class citizens. Built for programmatic access and automation.'
        },
        {
            icon: '🔑',
            title: 'Key-Based Sharing',
            description: 'Share the board key with your team. No invites, no permissions, no hassle.'
        },
        {
            icon: '🎯',
            title: 'Lightweight',
            description: '100 tasks max per board. Minimal surface area. Just what you need for a sprint.'
        },
        {
            icon: '🔓',
            title: 'Open by Default',
            description: 'Anyone with the key can view and edit. Collaboration without barriers.'
        }
    ];

    const codeSnippets = [
        {
            title: 'CLI Install & Create',
            code: `go install github.com/zeeshanejaz/kanbin/cli/cmd/kanbin@latest
kb board create "Sprint Planning"`
        },
        {
            title: 'API Request',
            code: `curl -X POST https://kanbin.app/api/boards \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My Board"}'`
        }
    ];

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        setError('');

        try {
            const board = await api.createBoard(title);
            navigate(`/b/${board.key}`);
        } catch (error: unknown) {
            import('axios').then(({ isAxiosError }) => {
                if (isAxiosError(error)) {
                    setError(error.response?.data?.error || 'Failed to create board');
                } else {
                    setError('Failed to create board');
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-container">
            <header className="hero">
                <h1>Ephemeral Kanban boards for humans and AI agents</h1>
                <p>No signup. No login. Just create a board, share the key, and let it auto-expire when you're done. Built for short-lived sprints and agentic workflows.</p>
            </header>

            <form className="create-board-form" onSubmit={handleCreate} aria-label="Create new board">
                <input
                    type="text"
                    placeholder="Name your new board..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    autoFocus
                    disabled={loading}
                    aria-label="Board name"
                    required
                />
                <button type="submit" disabled={loading || !title.trim()} className="btn-primary" aria-label="Create board">
                    {loading ? 'Creating...' : 'Create Board'}
                </button>
            </form>

            {error && <div className="error-message" role="alert">{error}</div>}

            <nav className="secondary-ctas" aria-label="Alternative ways to use Kanbin">
                <a href="https://github.com/zeeshanejaz/kanbin#cli-usage" className="secondary-link" target="_blank" rel="noopener noreferrer">
                    Try the CLI →
                </a>
                <span className="cta-separator" aria-hidden="true">•</span>
                <a href="/b/demo" className="secondary-link">
                    View Demo Board →
                </a>
            </nav>

            {/* Features Section */}
            <section className="landing-section features-section" aria-labelledby="features-heading">
                <h2 id="features-heading">Why Kanbin?</h2>
                <div className="features-grid" role="list">{features.map((feature, index) => (
                        <article key={index} className="feature-card" role="listitem">
                            <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="landing-section use-cases-section" aria-labelledby="use-cases-heading">
                <h2 id="use-cases-heading">Built For</h2>
                <ul className="use-cases-list" role="list">
                    <li className="use-case-item">🤖 AI agents running autonomous coding tasks</li>
                    <li className="use-case-item">👨‍💻 Solo devs needing a quick scratchpad board</li>
                    <li className="use-case-item">🚀 Weekend hackers and side projects</li>
                    <li className="use-case-item">⚡ Short-lived sprints (hours to days)</li>
                    <li className="use-case-item">👥 Pair programming sessions</li>
                </ul>
                <div className="anti-pattern" role="note">
                    <strong>Not built for:</strong> Long-term project management or permanent record-keeping
                </div>
            </section>

            {/* Quick Start Section */}
            <section className="landing-section quick-start-section" aria-labelledby="quick-start-heading">
                <h2 id="quick-start-heading">Get Started in 30 Seconds</h2>
                <div className="quick-start-grid">
                    <article className="quick-start-card">
                        <h3>🌐 Web UI</h3>
                        <p>Create a board above and share the key with your team. That's it.</p>
                    </article>
                    <article className="quick-start-card">
                        <h3>⌨️ CLI</h3>
                        <p>Install and create from your terminal:</p>
                        <div className="code-wrapper">
                            <code className="code-block">{codeSnippets[0].code}</code>
                            <button
                                className="copy-btn"
                                onClick={() => handleCopy(codeSnippets[0].code, 0)}
                                title="Copy to clipboard"
                                aria-label="Copy CLI commands to clipboard"
                            >
                                {copiedIndex === 0 ? '✓ Copied!' : '📋 Copy'}
                            </button>
                        </div>
                    </article>
                    <article className="quick-start-card">
                        <h3>🔌 API</h3>
                        <p>Use the REST API directly:</p>
                        <div className="code-wrapper">
                            <code className="code-block">{codeSnippets[1].code}</code>
                            <button
                                className="copy-btn"
                                onClick={() => handleCopy(codeSnippets[1].code, 1)}
                                title="Copy to clipboard"
                                aria-label="Copy API request to clipboard"
                            >
                                {copiedIndex === 1 ? '✓ Copied!' : '📋 Copy'}
                            </button>
                        </div>
                    </article>
                </div>
            </section>

            {/* Technical Details Section */}
            <section className="landing-section technical-details-section" aria-labelledby="technical-details-heading">
                <h2 id="technical-details-heading">What You Should Know</h2>
                <dl className="tech-details-grid">
                    <div className="tech-detail">
                        <dt><strong>Stack:</strong></dt>
                        <dd>Go backend, React frontend, PostgreSQL database</dd>
                    </div>
                    <div className="tech-detail">
                        <dt><strong>Limits:</strong></dt>
                        <dd>100 tasks per board, 7-day auto-expiry</dd>
                    </div>
                    <div className="tech-detail">
                        <dt><strong>Visibility:</strong></dt>
                        <dd>Boards are public to anyone with the key</dd>
                    </div>
                    <div className="tech-detail">
                        <dt><strong>Deletion:</strong></dt>
                        <dd>Automatic after 7 days, no recovery option</dd>
                    </div>
                    <div className="tech-detail">
                        <dt><strong>Cost:</strong></dt>
                        <dd>Free for anonymous boards (MVP1)</dd>
                    </div>
                </dl>
            </section>
        </div>
    );
}
