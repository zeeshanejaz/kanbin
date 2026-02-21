import type { Task } from '../api/client';

/**
 * Position calculation utilities for drag-and-drop
 * Uses fractional positioning strategy with 1000-unit gaps
 */

const POSITION_GAP = 1000;
const MIN_GAP = 10;

/**
 * Calculate position between two tasks
 * Uses fractional positioning to minimize database writes
 * 
 * @param before - Position of task before (or undefined if at start)
 * @param after - Position of task after (or undefined if at end)
 * @returns New position to insert task
 */
export function getPositionBetween(before: number | undefined, after: number | undefined): number {
  // If no tasks, start at POSITION_GAP
  if (before === undefined && after === undefined) {
    return POSITION_GAP;
  }
  
  // If inserting at start (before first task)
  if (before === undefined && after !== undefined) {
    return Math.floor(after / 2);
  }
  
  // If inserting at end (after last task)
  if (before !== undefined && after === undefined) {
    return before + POSITION_GAP;
  }
  
  // If inserting between two tasks
  if (before !== undefined && after !== undefined) {
    return Math.floor((before + after) / 2);
  }
  
  // Fallback (should never reach)
  return POSITION_GAP;
}

/**
 * Check if positions need rebalancing
 * Returns true if gaps are too small (< MIN_GAP)
 * 
 * @param tasks - Array of tasks to check
 * @returns true if rebalancing needed
 */
export function shouldRebalance(tasks: Task[]): boolean {
  if (tasks.length < 2) return false;
  
  const sorted = [...tasks].sort((a, b) => a.position - b.position);
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].position - sorted[i].position;
    if (gap < MIN_GAP) {
      return true;
    }
  }
  
  return false;
}

/**
 * Recalculate all positions with even gaps
 * Used when gaps become too small after many insertions
 * 
 * @param tasks - Array of tasks to rebalance
 * @returns Array of tasks with new positions
 */
export function recalculatePositions(tasks: Task[]): Task[] {
  if (tasks.length === 0) return tasks;
  
  const sorted = [...tasks].sort((a, b) => a.position - b.position);
  
  return sorted.map((task, index) => ({
    ...task,
    position: (index + 1) * POSITION_GAP,
  }));
}

/**
 * Get new position when moving task within same column
 * 
 * @param tasks - All tasks in the column
 * @param draggedTaskId - ID of task being moved
 * @param overTaskId - ID of task being hovered over
 * @returns New position for dragged task
 */
export function getNewPositionInColumn(
  tasks: Task[],
  draggedTaskId: string,
  overTaskId: string
): number {
  const sorted = [...tasks].sort((a, b) => a.position - b.position);
  const draggedIndex = sorted.findIndex(t => t.id === draggedTaskId);
  const overIndex = sorted.findIndex(t => t.id === overTaskId);
  
  if (draggedIndex === -1 || overIndex === -1) {
    return POSITION_GAP;
  }
  
  // If moving to same position, no change needed
  if (draggedIndex === overIndex) {
    return sorted[draggedIndex].position;
  }
  
  // Moving down in list
  if (draggedIndex < overIndex) {
    const after = sorted[overIndex];
    const before = overIndex < sorted.length - 1 ? sorted[overIndex + 1] : undefined;
    return getPositionBetween(after.position, before?.position);
  }
  
  // Moving up in list
  const after = sorted[overIndex];
  const before = overIndex > 0 ? sorted[overIndex - 1] : undefined;
  return getPositionBetween(before?.position, after.position);
}
