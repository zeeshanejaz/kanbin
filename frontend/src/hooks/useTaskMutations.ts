import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Task } from '../api/client';

/**
 * Mutation hook for creating a new task
 * Invalidates board query cache after successful creation
 */
export function useCreateTaskMutation(boardKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      return api.createTask(boardKey, title, description);
    },
    
    onSuccess: () => {
      // Invalidate board query to refetch with new task
      queryClient.invalidateQueries({ queryKey: ['board', boardKey] });
    },
  });
}

/**
 * Mutation hook for updating a task
 * Implements optimistic updates with automatic rollback on error
 */
export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Partial<Task> }) => {
      return api.updateTask(taskId, data);
    },

    // Optimistic update: immediately update cache before server responds
    onMutate: async ({ taskId, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['board'] });

      // Snapshot the previous value
      const previousBoards = queryClient.getQueriesData({ queryKey: ['board'] });

      // Optimistically update all board caches that contain this task
      queryClient.setQueriesData({ queryKey: ['board'] }, (old: unknown) => {
        if (!old || typeof old !== 'object' || !('tasks' in old)) return old;
        
        const boardData = old as { tasks: Task[] };
        return {
          ...boardData,
          tasks: boardData.tasks.map((task) =>
            task.id === taskId ? { ...task, ...data, updated_at: new Date().toISOString() } : task
          ),
        };
      });

      // Return context with snapshot for rollback
      return { previousBoards };
    },

    // If mutation fails, rollback to previous state
    onError: (_error, _variables, context) => {
      if (context?.previousBoards) {
        // Restore all affected board queries
        context.previousBoards.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    // Always refetch after error or success to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
}

/**
 * Mutation hook for deleting a task
 * Implements optimistic removal with automatic rollback on error
 */
export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      return api.deleteTask(taskId);
    },

    // Optimistic update: immediately remove from cache
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['board'] });

      const previousBoards = queryClient.getQueriesData({ queryKey: ['board'] });

      // Optimistically remove task from all board caches
      queryClient.setQueriesData({ queryKey: ['board'] }, (old: unknown) => {
        if (!old || typeof old !== 'object' || !('tasks' in old)) return old;
        
        const boardData = old as { tasks: Task[] };
        return {
          ...boardData,
          tasks: boardData.tasks.filter((task) => task.id !== taskId),
        };
      });

      return { previousBoards };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousBoards) {
        context.previousBoards.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
}
