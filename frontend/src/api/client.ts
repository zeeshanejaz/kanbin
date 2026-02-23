import axios from 'axios';

// Create an Axios instance pointing to the backend API.
// Note: In development, Vite will proxy /api to the backend.
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ETag cache for conditional requests
const etagCache = new Map<string, string>();

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    position: number;
    created_at: string;
    updated_at: string;
}

export interface Board {
    id: string;
    key: string;
    title: string;
    created_at: string;
    expires_at: string;
}

export interface BoardResponse extends Board {
    tasks: Task[];
}

// Cache for board data (used when server returns 304)
const boardCache = new Map<string, BoardResponse>();

// API Methods
export const api = {
    createBoard: async (title: string): Promise<Board> => {
        const res = await apiClient.post<Board>('/boards', { title });
        return res.data;
    },

    getBoard: async (key: string): Promise<BoardResponse> => {
        const cacheKey = `board:${key}`;
        const etag = etagCache.get(cacheKey);

        try {
            const res = await apiClient.get<BoardResponse>(`/boards/${key}`, {
                headers: etag ? { 'If-None-Match': etag } : {},
            });

            // Store new ETag if present
            const newETag = res.headers['etag'];
            if (newETag) {
                etagCache.set(cacheKey, newETag);
            }

            // Cache the response
            boardCache.set(cacheKey, res.data);
            
            return res.data;
        } catch (error) {
            // Handle 304 Not Modified
            if (axios.isAxiosError(error) && error.response?.status === 304) {
                const cached = boardCache.get(cacheKey);
                if (cached) {
                    return cached;
                }
                // Fallback: retry without ETag if cache miss
                etagCache.delete(cacheKey);
                return api.getBoard(key);
            }
            throw error;
        }
    },

    deleteBoard: async (key: string): Promise<void> => {
        await apiClient.delete(`/boards/${key}`);
        // Clear cache for deleted board
        const cacheKey = `board:${key}`;
        etagCache.delete(cacheKey);
        boardCache.delete(cacheKey);
    },

    createTask: async (boardKey: string, title: string, description: string = ''): Promise<Task> => {
        const res = await apiClient.post<Task>(`/boards/${boardKey}/tasks`, {
            title,
            description,
            status: 'TODO',
        });
        return res.data;
    },

    updateTask: async (taskId: string, data: Partial<Task>, boardKey: string): Promise<Task> => {
        const res = await apiClient.put<Task>(`/tasks/${taskId}`, data, {
            headers: { 'X-Board-Key': boardKey },
        });
        return res.data;
    },

    deleteTask: async (taskId: string, boardKey: string): Promise<void> => {
        await apiClient.delete(`/tasks/${taskId}`, {
            headers: { 'X-Board-Key': boardKey },
        });
    },
};
