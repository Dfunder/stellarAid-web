'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================================
// Content Tiers Types
// ============================================================

export type TierLevel = 'free' | 'bronze' | 'silver' | 'gold' | 'platinum';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';

export type BillingInterval = 'monthly' | 'yearly' | 'one-time';

export interface ContentTier {
  id: string;
  artistId: string;
  name: string;
  level: TierLevel;
  description: string;
  price: number;
  billingInterval: BillingInterval;
  features: string[];
  isActive: boolean;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  subscriberId: string;
  tierId: string;
  tier?: ContentTier;
  artistId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GatedContent {
  id: string;
  artistId: string;
  tierId: string;
  tierLevel: TierLevel;
  title: string;
  description?: string;
  contentType: 'image' | 'video' | 'text' | 'file' | 'link';
  contentUrl?: string;
  thumbnailUrl?: string;
  isPreview: boolean;
  previewContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentTierFilters {
  artistId?: string;
  level?: TierLevel;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  page?: number;
  limit?: number;
}

export interface PaginatedTierResponse {
  tiers: ContentTier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContentTierFormData {
  name: string;
  level: TierLevel;
  description: string;
  price: number;
  billingInterval: BillingInterval;
  features: string[];
}

export interface GatedContentFormData {
  tierId: string;
  title: string;
  description?: string;
  contentType: 'image' | 'video' | 'text' | 'file' | 'link';
  contentUrl?: string;
  thumbnailUrl?: string;
  isPreview: boolean;
  previewContent?: string;
}

// ============================================================
// State Interface
// ============================================================

interface ContentTiersState {
  // Tiers
  tiers: ContentTier[];
  currentTier: ContentTier | null;
  artistTiers: ContentTier[]; // Tiers for a specific artist
  
  // Subscriptions
  subscriptions: Subscription[];
  currentSubscription: Subscription | null;
  userSubscriptions: Subscription[];
  
  // Gated Content
  gatedContent: GatedContent[];
  accessibleContent: GatedContent[]; // Content user can access
  
  // Loading & Error
  loading: boolean;
  error: string | null;
}

const initialState: ContentTiersState = {
  tiers: [],
  currentTier: null,
  artistTiers: [],
  subscriptions: [],
  currentSubscription: null,
  userSubscriptions: [],
  gatedContent: [],
  accessibleContent: [],
  loading: false,
  error: null,
};

// ============================================================
// Slice
// ============================================================

const contentTiersSlice = createSlice({
  name: 'contentTiers',
  initialState,
  reducers: {
    // Tier reducers
    setTiers: (state, action: PayloadAction<ContentTier[]>) => {
      state.tiers = action.payload;
      state.error = null;
    },
    setCurrentTier: (state, action: PayloadAction<ContentTier | null>) => {
      state.currentTier = action.payload;
    },
    setArtistTiers: (state, action: PayloadAction<ContentTier[]>) => {
      state.artistTiers = action.payload;
    },
    addTier: (state, action: PayloadAction<ContentTier>) => {
      state.tiers.unshift(action.payload);
      state.artistTiers.unshift(action.payload);
    },
    updateTierInList: (state, action: PayloadAction<ContentTier>) => {
      const index = state.tiers.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tiers[index] = action.payload;
      }
      const artistIndex = state.artistTiers.findIndex((t) => t.id === action.payload.id);
      if (artistIndex !== -1) {
        state.artistTiers[artistIndex] = action.payload;
      }
      if (state.currentTier?.id === action.payload.id) {
        state.currentTier = action.payload;
      }
    },
    removeTier: (state, action: PayloadAction<string>) => {
      state.tiers = state.tiers.filter((t) => t.id !== action.payload);
      state.artistTiers = state.artistTiers.filter((t) => t.id !== action.payload);
      if (state.currentTier?.id === action.payload) {
        state.currentTier = null;
      }
    },
    
    // Subscription reducers
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload;
    },
    setCurrentSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.currentSubscription = action.payload;
    },
    setUserSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.userSubscriptions = action.payload;
    },
    addSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscriptions.push(action.payload);
      state.userSubscriptions.push(action.payload);
    },
    updateSubscription: (state, action: PayloadAction<Subscription>) => {
      const index = state.subscriptions.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
      const userIndex = state.userSubscriptions.findIndex((s) => s.id === action.payload.id);
      if (userIndex !== -1) {
        state.userSubscriptions[userIndex] = action.payload;
      }
      if (state.currentSubscription?.id === action.payload.id) {
        state.currentSubscription = action.payload;
      }
    },
    removeSubscription: (state, action: PayloadAction<string>) => {
      state.subscriptions = state.subscriptions.filter((s) => s.id !== action.payload);
      state.userSubscriptions = state.userSubscriptions.filter((s) => s.id !== action.payload);
      if (state.currentSubscription?.id === action.payload) {
        state.currentSubscription = null;
      }
    },
    
    // Gated content reducers
    setGatedContent: (state, action: PayloadAction<GatedContent[]>) => {
      state.gatedContent = action.payload;
    },
    setAccessibleContent: (state, action: PayloadAction<GatedContent[]>) => {
      state.accessibleContent = action.payload;
    },
    addGatedContent: (state, action: PayloadAction<GatedContent>) => {
      state.gatedContent.push(action.payload);
    },
    updateGatedContent: (state, action: PayloadAction<GatedContent>) => {
      const index = state.gatedContent.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.gatedContent[index] = action.payload;
      }
    },
    removeGatedContent: (state, action: PayloadAction<string>) => {
      state.gatedContent = state.gatedContent.filter((c) => c.id !== action.payload);
    },
    
    // Loading & Error reducers
    setContentTiersLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setContentTiersError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearContentTiers: (state) => {
      state.tiers = [];
      state.currentTier = null;
      state.artistTiers = [];
      state.subscriptions = [];
      state.currentSubscription = null;
      state.userSubscriptions = [];
      state.gatedContent = [];
      state.accessibleContent = [];
    },
  },
});

export const {
  // Tier actions
  setTiers,
  setCurrentTier,
  setArtistTiers,
  addTier,
  updateTierInList,
  removeTier,
  
  // Subscription actions
  setSubscriptions,
  setCurrentSubscription,
  setUserSubscriptions,
  addSubscription,
  updateSubscription,
  removeSubscription,
  
  // Gated content actions
  setGatedContent,
  setAccessibleContent,
  addGatedContent,
  updateGatedContent,
  removeGatedContent,
  
  // Loading & Error actions
  setContentTiersLoading,
  setContentTiersError,
  clearContentTiers,
} = contentTiersSlice.actions;

export default contentTiersSlice.reducer;
