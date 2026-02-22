import { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { apiClient } from './client';
import { useAuthStore } from '@/store/authStore';

// Request Interceptor: Attach Auth Token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token;

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Errors and Token Refresh
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (process.env.NODE_ENV === 'development') {
            console.error(`[API Error] ${error.response?.status} ${error.config?.url}`, error.response?.data || error.message);
        }

        // Handle 401 Unauthorized (Token Expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // TODO: Implement actual token refresh logic here
                // const newToken = await refreshAccessToken();
                // useAuthStore.getState().setToken(newToken);
                // originalRequest.headers.Authorization = `Bearer ${newToken}`;
                // return apiClient(originalRequest);

                // For now, logout on 401
                useAuthStore.getState().logout();
                return Promise.reject(error);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        // Standardize error handling
        const apiError = {
            message: (error.response?.data as any)?.message || error.message || 'An unexpected error occurred',
            status: error.response?.status,
            data: error.response?.data,
        };

        return Promise.reject(apiError);
    }
);

export { apiClient };

