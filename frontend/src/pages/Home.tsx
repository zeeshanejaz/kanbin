import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Home() {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
            <div className="hero">
                <h1>Instant Kanban Boards</h1>
                <p>No signup required. Create a board, share the key, get work done.</p>
            </div>

            <form className="create-board-form" onSubmit={handleCreate}>
                <input
                    type="text"
                    placeholder="Name your new board..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    autoFocus
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !title.trim()} className="btn-primary">
                    {loading ? 'Creating...' : 'Create Board'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
}
