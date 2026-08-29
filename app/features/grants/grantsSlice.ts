'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================================
// Grant Program Types
// ============================================================

export type GrantStatus = 
  | 'draft' 
  | 'open' 
  | 'voting' 
  | 'closed' 
  | 'awarded' 
  | 'distributed' 
  | 'completed';

export type ApplicationStatus = 
  | 'pending' 
  | 'reviewing' 
  | 'shortlisted' 
  | 'approved' 
  | 'rejected' 
  | 'awarded';

export type VoteType = 'upvote' | 'downvote';

export interface GrantApplicant {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  portfolioUrl?: string;
  verified?: boolean;
}

export interface GrantApplication {
  id: string;
  grantId: string;
  applicantId: string;
  applicant?: GrantApplicant;
  title: string;
  description: string;
  proposal: string;
  budget: number;
  timeline: string;
  deliverables: string[];
  portfolioLinks?: string[];
  status: ApplicationStatus;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface GrantVote {
  id: string;
  applicationId: string;
  voterId: string;
  voteType: VoteType;
  comment?: string;
  createdAt: string;
}

export interface GrantImpactMetric {
  id: string;
  grantId: string;
  recipientId: string;
  metricName: string;
  metricValue: number;
  metricUnit?: string;
  description?: string;
  reportedAt: string;
}

export interface GrantRecipient {
  id: string;
  grantId: string;
  applicationId: string;
  recipientId: string;
  recipient?: GrantApplicant;
  amount: number;
  distributedAmount: number;
  status: 'pending' | 'partial' | 'complete';
  walletAddress?: string;
  distributedAt?: string;
  createdAt: string;
}

export interface Grant {
  id: string;
  title: string;
  description: string;
  category: string;
  fundAmount: number;
  maxRecipients: number;
  applicationDeadline: string;
  votingDeadline: string;
  status: GrantStatus;
  creatorId: string;
  applicationCount: number;
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface GrantFilters {
  status?: GrantStatus;
  category?: string;
  sort?: 'newest' | 'deadline' | 'fund-amount' | 'most-applications';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedGrantResponse {
  grants: Grant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GrantApplicationFormData {
  title: string;
  description: string;
  proposal: string;
  budget: number;
  timeline: string;
  deliverables: string[];
  portfolioLinks?: string[];
}

export interface GrantFormData {
  title: string;
  description: string;
  category: string;
  fundAmount: number;
  maxRecipients: number;
  applicationDeadline: string;
  votingDeadline: string;
}

// ============================================================
// State Interface
// ============================================================

interface GrantsState {
  // Grants
  grants: Grant[];
  currentGrant: Grant | null;
  
  // Applications
  applications: GrantApplication[];
  currentApplication: GrantApplication | null;
  userApplications: GrantApplication[];
  
  // Votes
  votes: GrantVote[];
  userVotes: Record<string, VoteType>; // applicationId -> voteType
  
  // Recipients
  recipients: GrantRecipient[];
  
  // Impact
  impactMetrics: GrantImpactMetric[];
  
  // Loading & Error
  loading: boolean;
  error: string | null;
}

const initialState: GrantsState = {
  grants: [],
  currentGrant: null,
  applications: [],
  currentApplication: null,
  userApplications: [],
  votes: [],
  userVotes: {},
  recipients: [],
  impactMetrics: [],
  loading: false,
  error: null,
};

// ============================================================
// Slice
// ============================================================

const grantsSlice = createSlice({
  name: 'grants',
  initialState,
  reducers: {
    // Grant reducers
    setGrants: (state, action: PayloadAction<Grant[]>) => {
      state.grants = action.payload;
      state.error = null;
    },
    setCurrentGrant: (state, action: PayloadAction<Grant | null>) => {
      state.currentGrant = action.payload;
    },
    addGrant: (state, action: PayloadAction<Grant>) => {
      state.grants.unshift(action.payload);
    },
    updateGrantInList: (state, action: PayloadAction<Grant>) => {
      const index = state.grants.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.grants[index] = action.payload;
      }
      if (state.currentGrant?.id === action.payload.id) {
        state.currentGrant = action.payload;
      }
    },
    removeGrant: (state, action: PayloadAction<string>) => {
      state.grants = state.grants.filter((g) => g.id !== action.payload);
      if (state.currentGrant?.id === action.payload) {
        state.currentGrant = null;
      }
    },
    
    // Application reducers
    setApplications: (state, action: PayloadAction<GrantApplication[]>) => {
      state.applications = action.payload;
    },
    setCurrentApplication: (state, action: PayloadAction<GrantApplication | null>) => {
      state.currentApplication = action.payload;
    },
    setUserApplications: (state, action: PayloadAction<GrantApplication[]>) => {
      state.userApplications = action.payload;
    },
    addApplication: (state, action: PayloadAction<GrantApplication>) => {
      state.applications.unshift(action.payload);
      state.userApplications.unshift(action.payload);
    },
    updateApplicationInList: (state, action: PayloadAction<GrantApplication>) => {
      const index = state.applications.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
      const userIndex = state.userApplications.findIndex((a) => a.id === action.payload.id);
      if (userIndex !== -1) {
        state.userApplications[userIndex] = action.payload;
      }
      if (state.currentApplication?.id === action.payload.id) {
        state.currentApplication = action.payload;
      }
    },
    removeApplication: (state, action: PayloadAction<string>) => {
      state.applications = state.applications.filter((a) => a.id !== action.payload);
      state.userApplications = state.userApplications.filter((a) => a.id !== action.payload);
      if (state.currentApplication?.id === action.payload) {
        state.currentApplication = null;
      }
    },
    
    // Vote reducers
    setVotes: (state, action: PayloadAction<GrantVote[]>) => {
      state.votes = action.payload;
    },
    addVote: (state, action: PayloadAction<GrantVote>) => {
      state.votes.push(action.payload);
      state.userVotes[action.payload.applicationId] = action.payload.voteType;
    },
    setUserVotes: (state, action: PayloadAction<Record<string, VoteType>>) => {
      state.userVotes = action.payload;
    },
    
    // Recipient reducers
    setRecipients: (state, action: PayloadAction<GrantRecipient[]>) => {
      state.recipients = action.payload;
    },
    addRecipient: (state, action: PayloadAction<GrantRecipient>) => {
      state.recipients.push(action.payload);
    },
    updateRecipient: (state, action: PayloadAction<GrantRecipient>) => {
      const index = state.recipients.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.recipients[index] = action.payload;
      }
    },
    
    // Impact reducers
    setImpactMetrics: (state, action: PayloadAction<GrantImpactMetric[]>) => {
      state.impactMetrics = action.payload;
    },
    addImpactMetric: (state, action: PayloadAction<GrantImpactMetric>) => {
      state.impactMetrics.push(action.payload);
    },
    
    // Loading & Error reducers
    setGrantsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setGrantsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearGrants: (state) => {
      state.grants = [];
      state.currentGrant = null;
      state.applications = [];
      state.currentApplication = null;
      state.userApplications = [];
      state.votes = [];
      state.userVotes = {};
      state.recipients = [];
      state.impactMetrics = [];
    },
  },
});

export const {
  // Grant actions
  setGrants,
  setCurrentGrant,
  addGrant,
  updateGrantInList,
  removeGrant,
  
  // Application actions
  setApplications,
  setCurrentApplication,
  setUserApplications,
  addApplication,
  updateApplicationInList,
  removeApplication,
  
  // Vote actions
  setVotes,
  addVote,
  setUserVotes,
  
  // Recipient actions
  setRecipients,
  addRecipient,
  updateRecipient,
  
  // Impact actions
  setImpactMetrics,
  addImpactMetric,
  
  // Loading & Error actions
  setGrantsLoading,
  setGrantsError,
  clearGrants,
} = grantsSlice.actions;

export default grantsSlice.reducer;
