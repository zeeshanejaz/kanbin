import axios from 'axios';

// Create an Axios instance pointing to the backend API.
// Note: In development, Vite will proxy /api to the backend.
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Task {
    id: string;
    board_id: string;
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

// API Methods
export const api = {
    createBoard: async (title: string): Promise<Board> => {
        const res = await apiClient.post<Board>('/boards', { title });
        return res.data;
    },

    getBoard: async (key: string): Promise<BoardResponse> => {
        const res = await apiClient.get<BoardResponse>(`/boards/${key}`);
        return res.data;
    },

    deleteBoard: async (key: string): Promise<void> => {
        await apiClient.delete(`/boards/${key}`);
    },

    createTask: async (boardKey: string, title: string, description: string = ''): Promise<Task> => {
        const res = await apiClient.post<Task>(`/boards/${boardKey}/tasks`, {
            title,
            description,
            status: 'TODO',
        });
        return res.data;
    },

    updateTask: async (taskId: string, data: Partial<Task>): Promise<Task> => {
        const res = await apiClient.put<Task>(`/tasks/${taskId}`, data);
        return res.data;
    },

    deleteTask: async (taskId: string): Promise<void> => {
        await apiClient.delete(`/tasks/${taskId}`);
    },
};
