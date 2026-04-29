import { User } from './index';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterRequest {
  email: string;
  role: 'donor' | 'creator';
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
export type ProjectStatus = "active" | "completed" | "almost-funded" | "paused" | "draft";

export interface ProjectCreator {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    verified?: boolean;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    targetAmount: string;
    currentAmount: string;
    creatorId: string;
    imageUrl?: string;
    imageUrls?: string[];
    category?: string;
    status?: ProjectStatus;
    isVerified?: boolean;
    isUrgent?: boolean;
    donorCount?: number;
    donors?: number;
    deadline?: string;
    daysRemaining?: number;
    location?: string;
    summary?: string;
    impact?: string;
    story?: string;
    creator?: ProjectCreator;
    updates?: Update[];
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
  asset?: string;
  message?: string;
  status?: 'CONFIRMED' | 'PENDING' | 'FAILED';
  projectTitle?: string;
  txHash?: string;
  createdAt: string;
}

export interface CreateDonationRequest {
  projectId: string;
  amount: string;
  txHash?: string;
}

export interface SendDonationConfirmationEmailRequest {
  donationId?: string;
  projectId: string;
  projectTitle: string;
  amount: string;
  asset: string;
  txHash: string;
  donatedAt: string;
  donorEmail?: string;
}

export interface Update {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  imageUrls?: string[];
  createdAt: string;
}

export interface CreateUpdateRequest {
  title: string;
  content: string;
  imageUrls?: string[];
}
