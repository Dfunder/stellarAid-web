// 'use client';

// import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
// import { store } from '../store';
// import env from '../config/env';
// import { toastError } from '@/utils/toast';

// // Create a type for our auth state - adjust based on actual auth slice implementation
// interface AuthState {
//   token: string | null;
// }

// // Extend Axios request config to include our custom properties
// interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
//   _retry?: boolean;
// }

// // Extend AxiosError to include validationErrors property
// interface CustomAxiosError extends AxiosError {
//   validationErrors?: any;
// }

// // Create configured Axios instance
// const api = axios.create({
//   baseURL: env.apiBaseUrl,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 30000, // 30 second timeout
// });

// // Request interceptor to attach JWT token
// api.interceptors.request.use(
//   (config: CustomAxiosRequestConfig) => {
//     // Get the auth token from Redux store - adjust the state path based on your actual auth slice
//     // This assumes you have an auth slice with a token field; update the path if your store is structured differently
//     const state = store.getState();
//     // @ts-ignore - This will be properly typed once auth slice is added to the store
//     const token: string | null = state.auth?.token || null;

//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error: AxiosError) => {
//     console.error('Request interceptor error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error: CustomAxiosError) => {
//     const originalRequest = error.config as CustomAxiosRequestConfig;

//     // Handle 401 Unauthorized - log user out
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       // Dispatch logout action to clear auth state
//       // This assumes you have a logout action in your auth slice
//       // @ts-ignore - This will be properly typed once auth slice is added
//       if (store.dispatch && store.dispatch({ type: 'auth/logout' })) {
//         // Clear any stored tokens/localStorage if needed
//         localStorage.removeItem('authToken');
//         sessionStorage.removeItem('authToken');

//         // Show error message
//         toastError('Your session has expired. Please log in again.');

//         // Redirect to login page
//         if (typeof window !== 'undefined') {
//           window.location.href = '/login';
//         }
//       }
//     }

//     // Handle 400 Bad Request and 422 Unprocessable Entity - validation errors
//     if (error.response?.status === 400 || error.response?.status === 422) {
//       const data = error.response.data as any;
//       let errorMessage = 'Validation failed';

//       // Extract error messages from different possible formats
//       if (data?.message) {
//         errorMessage = data.message;
//       } else if (data?.errors) {
//         // If errors is an object with array of messages
//         if (typeof data.errors === 'object') {
//           const errorMessages = Object.values(data.errors).flat() as string[];
//           errorMessage = errorMessages.join(' ');
//         }
//         // If errors is a string
//         else if (typeof data.errors === 'string') {
//           errorMessage = data.errors;
//         }
//       } else if (data?.error) {
//         errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
//       }

//       // Show validation error toast
//       toastError(errorMessage);

//       // Add the extracted error to the error object for easier handling in components
//       error.validationErrors = data?.errors || null;
//     }

//     // Handle 500 Internal Server Error
//     if (error.response?.status === 500) {
//       toastError('Server error. Please try again later.');
//     }

//     // Handle network errors
//     if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
//       toastError('Network error. Please check your internet connection.');
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
