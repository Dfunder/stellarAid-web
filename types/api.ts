import { User } from './index';

export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
}

export interface ApiError {
    message: string;
    status?: number;
    data?: any;
}

// Auth Types
export interface LoginResponse {
    user: User;
    token: string;
    refreshToken?: string;
}

export interface RegisterRequest {
    email: string;
    role: "donor" | "creator";
    password?: string;
    confirmPassword?: string;
}

export interface VerifyEmailRequest {
    token: string;
}

export interface ResendEmailRequest {
    email: string;
}

export interface ChangeEmailRequest {
    email: string;
}

// Project Types
export interface Project {
    id: string;
    title: string;
    description: string;
    targetAmount: string;
    currentAmount: string;
    creatorId: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectRequest {
    title: string;
    description: string;
    targetAmount: string;
    imageUrl?: string;
}

// Donation Types
export interface Donation {
    id: string;
    projectId: string;
    donorId: string;
    amount: string;
    txHash?: string;
    createdAt: string;
}

export interface CreateDonationRequest {
    projectId: string;
    amount: string;
    txHash?: string;
}
