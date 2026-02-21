import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { BoardResponse, Task } from '../api/client';
import TaskCard from '../components/TaskCard';
import NewTaskModal from '../components/NewTaskModal';

const COLUMNS = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'DONE', title: 'Done' }
] as const;

export default function BoardView() {
    const { key } = useParams<{ key: string }>();
    const navigate = useNavigate();

    const [boardData, setBoardData] = useState<BoardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!key) return;
        loadBoard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const loadBoard = async () => {
        try {
            setLoading(true);
            const data = await api.getBoard(key!);
            setBoardData(data);
        } catch (error: unknown) {
            import('axios').then(({ isAxiosError }) => {
                if (isAxiosError(error)) {
                    if (error.response?.status === 404 || error.response?.status === 410) {
                        setError(error.response?.data?.error || 'Board not found or expired');
                    } else {
                        setError('Failed to load board');
                    }
                } else {
                    setError('Failed to load board');
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTaskCreate = async (title: string, description: string) => {
        if (!boardData) return;
        try {
            await api.createTask(boardData.key, title, description);
            await loadBoard(); // Reload for simplicity in MVP1
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to create task", err);
            alert("Failed to create task. Limit reached?");
        }
    };

    const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
        if (!boardData) return;

        try {
            // Optimistic update
            setBoardData(prev => prev ? {
                ...prev,
                tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
            } : null);

            // Only send the changed field
            await api.updateTask(taskId, { status: newStatus });
        } catch (err) {
            console.error("Failed to update status", err);
            loadBoard(); // Revert
        }
    };

    const handleTaskDelete = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.deleteTask(taskId);
            loadBoard();
        } catch (err) {
            console.error("Failed to delete task", err);
        }
    };

    const handleBoardDelete = async () => {
        if (!key) return;
        if (!confirm("Are you sure? This will delete the board and all tasks immediately.")) return;

        try {
            await api.deleteBoard(key);
            navigate('/');
        } catch (err) {
            console.error("Failed to delete board", err);
            alert("Failed to delete board");
        }
    };

    if (loading) return <div className="loader">Loading board...</div>;
    if (error) return (
        <div className="error-container">
            <h2>Oops!</h2>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Back Home</button>
        </div>
    );
    if (!boardData) return null;

    const tasksByColumn = COLUMNS.reduce((acc, col) => {
        acc[col.id] = boardData.tasks.filter(t => t.status === col.id);
        return acc;
    }, {} as Record<string, Task[]>);

    return (
        <div className="board-container">
            <div className="board-header">
                <div>
                    <h1 className="board-title">{boardData.title}</h1>
                    <div className="board-meta">
                        <span>Key: <strong>{boardData.key}</strong></span>
                        <span className="divider">|</span>
                        <span>Expires: {new Date(boardData.expires_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="board-actions">
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        + New Task
                    </button>
                    <button className="btn-danger" onClick={handleBoardDelete}>
                        Delete Board
                    </button>
                </div>
            </div>

            <div className="kanban-grid">
                {COLUMNS.map(col => (
                    <div key={col.id} className="kanban-column">
                        <h3 className="column-title">
                            {col.title} <span className="task-count">{tasksByColumn[col.id].length}</span>
                        </h3>
                        <div className="task-list">
                            {tasksByColumn[col.id].map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onStatusChange={handleTaskStatusChange}
                                    onDelete={handleTaskDelete}
                                />
                            ))}
                            {tasksByColumn[col.id].length === 0 && (
                                <div className="empty-column">No tasks</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <NewTaskModal
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleTaskCreate}
                />
            )}
        </div>
    );
}
