import { useQuery } from '@tanstack/react-query';
import { api, type BoardResponse } from '../api/client';

/**
 * React Query hook for fetching board data
 * 
 * Features:
 * - Automatic polling every 10 seconds (configured in queryClient)
 * - Smart caching with 5s stale time
 * - Automatic refetch on window focus
 * - ETag support (to be implemented in api client)
 * 
 * @param boardKey - The unique board key
 * @returns Query result with board data, loading, and error states
 */
export function useBoardQuery(boardKey: string | undefined) {
  return useQuery<BoardResponse>({
    // Unique query key for this board
    queryKey: ['board', boardKey],
    
    // Fetch function
    queryFn: () => {
      if (!boardKey) {
        throw new Error('Board key is required');
      }
      return api.getBoard(boardKey);
    },
    
    // Only run query if boardKey is provided
    enabled: !!boardKey,
    
    // Don't retry on 404 (board not found/expired)
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}
