import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Task } from '../api/client';

interface Props {
    task: Task;
    onDelete: (id: string) => void;
}

function TaskCard({ task, onDelete }: Props) {
    // Determine if the task has been updated (more than 1 second difference)
    const createdTime = new Date(task.created_at).getTime();
    const updatedTime = new Date(task.updated_at).getTime();
    const isUpdated = (updatedTime - createdTime) > 1000;
    
    const timeLabel = isUpdated ? 'Updated' : 'Created';
    const timeValue = formatDistanceToNow(new Date(isUpdated ? task.updated_at : task.created_at), { addSuffix: true });

    return (
        <div className="task-card">
            <div className="task-header">
                <h4 className="task-title">{task.title}</h4>
                <button className="icon-btn danger" onClick={() => onDelete(task.id)} title="Delete Task">&times;</button>
            </div>
            {task.description && <p className="task-desc">{task.description}</p>}

            <div className="task-footer">
                <span className="task-date">
                    <span className="task-date-label">{timeLabel}</span> {timeValue}
                </span>
            </div>
        </div>
    );
}

export default memo(TaskCard);
