import { apiClient } from './interceptors';
import { Project, ApiResponse, CreateProjectRequest } from '@/types/api';

export const projectsApi = {
    getProjects: async (): Promise<ApiResponse<Project[]>> => {
        const response = await apiClient.get<ApiResponse<Project[]>>('/projects');
        return response.data;
    },

    getProjectById: async (id: string): Promise<ApiResponse<Project>> => {
        const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
        return response.data;
    },

    createProject: async (data: CreateProjectRequest): Promise<ApiResponse<Project>> => {
        const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
        return response.data;
    },

    updateProject: async (id: string, data: Partial<CreateProjectRequest>): Promise<ApiResponse<Project>> => {
        const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
        return response.data;
    },

    deleteProject: async (id: string): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete<ApiResponse<void>>(`/projects/${id}`);
        return response.data;
    },
};
