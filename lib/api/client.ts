import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Pre-configured Axios instance.
 *
 * - baseURL from NEXT_PUBLIC_API_URL
 * - Request interceptor: attaches Bearer token from authStore (zustand)
 * - Response interceptor: handles 401 → token refresh with queuing
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Token helpers (client-side only) ───────────────────────────

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return useAuthStore.getState().accessToken;
}

function clearAuth(): void {
  if (typeof window === 'undefined') return;
  useAuthStore.getState().logout();
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// ── Refresh queue ──────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

// ── Request interceptor ────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor ───────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await axios.post(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/auth/refresh',
        { refreshToken },
      );

      const { accessToken, refreshToken: newRefreshToken } = data;

      // Persist tokens
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      // Update auth store if user is already logged in
      const { user } = useAuthStore.getState();
      if (user) {
        useAuthStore.getState().login(user, accessToken);
      }

      processQueue(null, accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { apiClient };
export default apiClient;
