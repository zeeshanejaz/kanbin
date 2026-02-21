import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { 
    DndContext, 
    PointerSensor, 
    KeyboardSensor,
    TouchSensor,
    DragOverlay,
    useSensor, 
    useSensors,
    closestCorners 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { api } from '../api/client';
import type { Task } from '../api/client';
import NewTaskModal from '../components/NewTaskModal';
import TaskCard from '../components/TaskCard';
import KanbanColumn from '../components/KanbanColumn';
import DraggableTaskCard from '../components/DraggableTaskCard';
import { useBoardQuery } from '../hooks/useBoardQuery';
import { useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from '../hooks/useTaskMutations';
import { getNewPositionInColumn } from '../lib/positions';

const COLUMNS = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'DONE', title: 'Done' }
] as const;

export default function BoardView() {
    const { key } = useParams<{ key: string }>();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    // React Query hooks
    const { data: boardData, isLoading, error } = useBoardQuery(key);
    const createTaskMutation = useCreateTaskMutation(key || '');
    const updateTaskMutation = useUpdateTaskMutation();
    const deleteTaskMutation = useDeleteTaskMutation();

    // Drag and drop sensors - pointer, touch, and keyboard
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required to start drag (prevents accidental drags)
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // Long press for 250ms to start drag on touch
                tolerance: 5, // Allow 5px movement during press
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setIsDragging(true);
        const activeTaskId = event.active.id as string;
        const task = boardData?.tasks.find(t => t.id === activeTaskId);
        setActiveTask(task || null);
    }, [boardData]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setIsDragging(false);
        setActiveTask(null);
        const { active, over } = event;

        // Edge case: No valid drop target
        if (!over || !boardData) return;

        const activeTaskId = active.id as string;
        const overId = over.id as string;

        // Edge case: Dropped on itself
        if (activeTaskId === overId) return;

        // Find the task being dragged
        const activeTask = boardData.tasks.find(t => t.id === activeTaskId);
        if (!activeTask) return;

        // Determine target status and position
        let targetStatus: Task['status'] = activeTask.status;
        let overTaskId: string | null = null;

        // Check if dropping on a column (vs dropping on a task)
        const isColumnDrop = COLUMNS.some(col => col.id === overId);
        
        if (isColumnDrop) {
            // Dropping on a column directly (e.g., empty column area)
            targetStatus = overId as Task['status'];
        } else {
            // Dropping on another task
            const overTask = boardData.tasks.find(t => t.id === overId);
            if (overTask) {
                targetStatus = overTask.status;
                overTaskId = overId;
            }
        }

        // Edge case: If status and position would be the same, do nothing
        if (targetStatus === activeTask.status && activeTaskId === overId) {
            return;
        }

        // Get tasks in the target column
        const targetColumnTasks = boardData.tasks.filter(t => t.status === targetStatus);

        // Calculate new position
        let newPosition: number;
        
        if (isColumnDrop && targetColumnTasks.length === 0) {
            // Edge case: Dropping on empty column - start at 1000
            newPosition = 1000;
        } else if (isColumnDrop && targetColumnTasks.length > 0) {
            // Edge case: Dropping on column area (not on specific task) - place at end
            const maxPosition = Math.max(...targetColumnTasks.map(t => t.position));
            newPosition = maxPosition + 1000;
        } else if (overTaskId) {
            // Normal case: Dropping on another task - calculate position relative to it
            // For cross-column: temporarily add dragged task to target column for calculation
            const tasksForCalculation = targetStatus === activeTask.status 
                ? targetColumnTasks 
                : [...targetColumnTasks, { ...activeTask, status: targetStatus }];
            newPosition = getNewPositionInColumn(tasksForCalculation, activeTaskId, overTaskId);
        } else {
            // Fallback
            newPosition = 1000;
        }

        // Build update object
        const updates: Partial<Task> = {};
        
        if (activeTask.status !== targetStatus) {
            updates.status = targetStatus;
        }
        
        if (activeTask.position !== newPosition) {
            updates.position = newPosition;
        }

        // Edge case: Nothing actually changed (dropped back to original position)
        if (Object.keys(updates).length === 0) {
            return;
        }

        // Update task with optimistic updates
        updateTaskMutation.mutateAsync({ 
            taskId: activeTaskId, 
            data: updates 
        }).catch(err => {
            console.error("Failed to update task", err);
        });
    }, [boardData, updateTaskMutation]);

    const handleTaskCreate = useCallback(async (title: string, description: string) => {
        try {
            await createTaskMutation.mutateAsync({ title, description });
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to create task", err);
            alert("Failed to create task. Limit reached?");
        }
    }, [createTaskMutation, setIsModalOpen]);

    const handleTaskDelete = useCallback(async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTaskMutation.mutateAsync(taskId);
        } catch (err) {
            console.error("Failed to delete task", err);
        }
    }, [deleteTaskMutation]);

    const handleBoardDelete = useCallback(async () => {
        if (!key) return;
        if (!confirm("Are you sure? This will delete the board and all tasks immediately.")) return;

        try {
            await api.deleteBoard(key);
            navigate('/');
        } catch (err) {
            console.error("Failed to delete board", err);
            alert("Failed to delete board");
        }
    }, [key, navigate]);

    // Loading state
    if (isLoading) return <div className="loader">Loading board...</div>;
    
    // Error state
    if (error) {
        let errorMessage = 'Failed to load board';
        if (isAxiosError(error)) {
            if (error.response?.status === 404 || error.response?.status === 410) {
                errorMessage = error.response?.data?.error || 'Board not found or expired';
            }
        }
        return (
            <div className="error-container">
                <h2>Oops!</h2>
                <p>{errorMessage}</p>
                <button className="btn-primary" onClick={() => navigate('/')}>Back Home</button>
            </div>
        );
    }
    
    if (!boardData) return null;

    const tasksByColumn = COLUMNS.reduce((acc, col) => {
        acc[col.id] = boardData.tasks.filter(t => t.status === col.id);
        return acc;
    }, {} as Record<string, Task[]>);

    return (
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setIsDragging(false)}
        >
            <div className="board-container">
                <div className="board-header">
                    <div>
                        <h1 className="board-title">{boardData.title}</h1>
                        <div className="board-meta">
                            <span>Key: <strong>{boardData.key}</strong></span>
                            <span className="divider">|</span>
                            <span>Expires: {formatDistanceToNow(new Date(boardData.expires_at), { addSuffix: true })}</span>
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
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            tasks={tasksByColumn[col.id]}
                            taskCount={tasksByColumn[col.id].length}
                            isDragging={isDragging}
                        >
                            {tasksByColumn[col.id].map(task => (
                                <DraggableTaskCard
                                    key={task.id}
                                    task={task}
                                    onDelete={handleTaskDelete}
                                />
                            ))}
                            {tasksByColumn[col.id].length === 0 && (
                                <div className="empty-column">No tasks</div>
                            )}
                        </KanbanColumn>
                    ))}
                </div>

                {isModalOpen && (
                    <NewTaskModal
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleTaskCreate}
                    />
                )}

                {/* Drag Overlay - shows a copy of the task being dragged */}
                <DragOverlay dropAnimation={null}>
                    {activeTask ? (
                        <div className="drag-overlay-card">
                            <TaskCard
                                task={activeTask}
                                onDelete={() => {}}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
