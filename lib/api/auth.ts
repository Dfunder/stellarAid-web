import { apiClient } from "./interceptors";
import { 
  LoginResponse, 
  ApiResponse, 
  RegisterRequest, 
  LoginCredentials,
  VerifyEmailRequest, 
  ResendEmailRequest, 
  ChangeEmailRequest,
} from "@/types/api";
import type { User } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      credentials,
    );
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/register",
      data,
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },

  forgotPassword: async (data: { email: string }): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      "/users/forgot-password",
      data,
    );
    return response.data;
  },

  resetPassword: async (data: { token: string; password: string }): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      "/users/reset-password",
      data,
    );
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      "/auth/verify-email",
      data,
    );
    return response.data;
  },

  resendVerification: async (data: ResendEmailRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      "/auth/resend-verification",
      data,
    );
    return response.data;
  },

  changeEmail: async (data: ChangeEmailRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>(
      "/auth/change-email",
      data,
    );
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/refresh-token",
    );
    return response.data;
  },

  socialLogin: async (data: { provider: string; token: string }): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/social-login",
      data,
    );
    return response.data;
  },

  linkSocialAccount: async (data: { provider: string; token: string }): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      "/auth/social-link",
      data,
    );
    return response.data;
  },

  disconnectSocialAccount: async (provider: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/auth/social-unlink/${provider}`
    );
    return response.data;
  },
};
