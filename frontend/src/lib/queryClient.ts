import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration for kanban board
 * 
 * Configuration optimized for:
 * - Periodic background sync (10s polling)
 * - Smart caching with ETags
 * - Optimistic updates with automatic rollback
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 seconds
      staleTime: 5000,
      
      // Keep unused data in cache for 5 minutes
      gcTime: 300000, // formerly cacheTime in v4
      
      // Poll for updates every 10 seconds when window is focused
      refetchInterval: 10000,
      
      // Don't poll when tab is inactive (save resources)
      refetchIntervalInBackground: false,
      
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
      
      // Retry failed requests up to 3 times
      retry: 3,
      
      // Exponential backoff: 1s, 2s, 4s (max 30s)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      
      // 2 second delay before retry
      retryDelay: 2000,
    },
  },
});
