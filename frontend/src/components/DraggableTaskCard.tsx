import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import type { Task } from '../api/client';

interface DraggableTaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

function DraggableTaskCard({ task, onDelete }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-task-wrapper ${isDragging ? 'is-dragging' : ''}`}

      aria-label={`Task: ${task.title}`}
      {...attributes}
      {...listeners}
    >
      {/* Hidden instructions for screen readers */}
      <div id={`task-instructions-${task.id}`} className="sr-only">
        Press space to pick up. Use arrow keys to move. Press space again to drop. Press escape to cancel.
      </div>
      
      {/* Task card */}
      <TaskCard
        task={task}
        onDelete={onDelete}
      />
    </div>
  );
}

export default memo(DraggableTaskCard);
