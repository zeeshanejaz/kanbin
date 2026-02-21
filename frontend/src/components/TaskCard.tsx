import type { Task } from '../api/client';

interface Props {
    task: Task;
    onStatusChange: (id: string, status: Task['status']) => void;
    onDelete: (id: string) => void;
}

export default function TaskCard({ task, onStatusChange, onDelete }: Props) {
    return (
        <div className="task-card">
            <div className="task-header">
                <h4 className="task-title">{task.title}</h4>
                <button className="icon-btn danger" onClick={() => onDelete(task.id)} title="Delete Task">&times;</button>
            </div>
            {task.description && <p className="task-desc">{task.description}</p>}

            <div className="task-footer">
                <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
                    className="status-dropdown"
                >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                </select>
                <span className="task-date">{new Date(task.updated_at).toLocaleDateString()}</span>
            </div>
        </div>
    );
}
