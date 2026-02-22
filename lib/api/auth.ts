import { apiClient } from './interceptors';
import { LoginResponse, ApiResponse, RegisterRequest } from '@/types/api';

export const authApi = {
    login: async (credentials: any): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    getCurrentUser: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>('/auth/me');
        return response.data;
    },
};
