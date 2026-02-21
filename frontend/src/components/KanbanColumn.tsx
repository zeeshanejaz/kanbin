import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '../api/client';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  taskCount: number;
  isDragging: boolean;
  children: React.ReactNode;
}

function KanbanColumn({ id, title, tasks, taskCount, isDragging, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  // Extract task IDs for sortable context
  const taskIds = tasks.map(task => task.id);

  // Combine class names: highlight when dragged over, subtle indicator when any drag is active
  const columnClass = `kanban-column ${isOver ? 'drag-over' : ''} ${isDragging && !isOver ? 'drag-active' : ''}`.trim();

  return (
    <div 
      ref={setNodeRef}
      className={columnClass}
      role="region"
      aria-label={`${title} column with ${taskCount} task${taskCount !== 1 ? 's' : ''}`}
    >
      <h3 className="column-title">
        {title} <span className="task-count">{taskCount}</span>
      </h3>
      <SortableContext 
        items={taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="task-list">
          {children}
        </div>
      </SortableContext>
    </div>
  );
}

export default memo(KanbanColumn);
