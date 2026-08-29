'use client';

import { RootState } from '@/app/store';
import { TierLevel, SubscriptionStatus } from './contentTiersSlice';

// ============================================================
// Tier Selectors
// ============================================================

export const selectTiers = (state: RootState) => state.contentTiers.tiers;
export const selectCurrentTier = (state: RootState) => state.contentTiers.currentTier;
export const selectArtistTiers = (state: RootState) => state.contentTiers.artistTiers;
export const selectContentTiersLoading = (state: RootState) => state.contentTiers.loading;
export const selectContentTiersError = (state: RootState) => state.contentTiers.error;

// Filter tiers by level
export const selectFreeTiers = (state: RootState) =>
  state.contentTiers.tiers.filter((t) => t.level === 'free');

export const selectBronzeTiers = (state: RootState) =>
  state.contentTiers.tiers.filter((t) => t.level === 'bronze');

export const selectSilverTiers = (state: RootState) =>
  state.contentTiers.tiers.filter((t) => t.level === 'silver');

export const selectGoldTiers = (state: RootState) =>
  state.contentTiers.tiers.filter((t) => t.level === 'gold');

export const selectPlatinumTiers = (state: RootState) =>
  state.contentTiers.tiers.filter((t) => t.level === 'platinum');

// Get active tiers only
export const selectActiveTiers = (state: RootState) =>
  state.contentTiers.tiers.filter((t) => t.isActive);

// Sort tiers by price
export const selectTiersByPriceAsc = (state: RootState) =>
  [...state.contentTiers.tiers].sort((a, b) => a.price - b.price);

export const selectTiersByPriceDesc = (state: RootState) =>
  [...state.contentTiers.tiers].sort((a, b) => b.price - a.price);

// Sort tiers by subscriber count (most popular first)
export const selectPopularTiers = (state: RootState) =>
  [...state.contentTiers.tiers].sort((a, b) => b.subscriberCount - a.subscriberCount);

// ============================================================
// Subscription Selectors
// ============================================================

export const selectSubscriptions = (state: RootState) => state.contentTiers.subscriptions;
export const selectCurrentSubscription = (state: RootState) => state.contentTiers.currentSubscription;
export const selectUserSubscriptions = (state: RootState) => state.contentTiers.userSubscriptions;

// Filter subscriptions by status
export const selectActiveSubscriptions = (state: RootState) =>
  state.contentTiers.userSubscriptions.filter((s) => s.status === 'active');

export const selectCancelledSubscriptions = (state: RootState) =>
  state.contentTiers.userSubscriptions.filter((s) => s.status === 'cancelled');

export const selectExpiredSubscriptions = (state: RootState) =>
  state.contentTiers.userSubscriptions.filter((s) => s.status === 'expired');

// Check if user is subscribed to a specific tier
export const selectIsSubscribedToTier = (tierId: string) => (state: RootState) =>
  state.contentTiers.userSubscriptions.some(
    (s) => s.tierId === tierId && s.status === 'active'
  );

// Check if user is subscribed to any tier from an artist
export const selectIsSubscribedToArtist = (artistId: string) => (state: RootState) =>
  state.contentTiers.userSubscriptions.some(
    (s) => s.artistId === artistId && s.status === 'active'
  );

// Get user's subscription for a specific tier
export const selectSubscriptionForTier = (tierId: string) => (state: RootState) =>
  state.contentTiers.userSubscriptions.find((s) => s.tierId === tierId) || null;

// Get user's highest tier for an artist
export const selectHighestTierForArtist = (artistId: string) => (state: RootState) => {
  const tierLevels: TierLevel[] = ['platinum', 'gold', 'silver', 'bronze', 'free'];
  const artistSubscriptions = state.contentTiers.userSubscriptions.filter(
    (s) => s.artistId === artistId && s.status === 'active'
  );
  
  for (const level of tierLevels) {
    const subscription = artistSubscriptions.find((s) => s.tier?.level === level);
    if (subscription) return subscription.tier;
  }
  
  return null;
};

// ============================================================
// Gated Content Selectors
// ============================================================

export const selectGatedContent = (state: RootState) => state.contentTiers.gatedContent;
export const selectAccessibleContent = (state: RootState) => state.contentTiers.accessibleContent;

// Check if user can access specific content
export const selectCanAccessContent = (contentId: string) => (state: RootState) =>
  state.contentTiers.accessibleContent.some((c) => c.id === contentId);

// Get content user cannot access
export const selectLockedContent = (state: RootState) =>
  state.contentTiers.gatedContent.filter(
    (c) => !state.contentTiers.accessibleContent.some((ac) => ac.id === c.id)
  );

// Get preview content only
export const selectPreviewContent = (state: RootState) =>
  state.contentTiers.gatedContent.filter((c) => c.isPreview);

// Get content by tier level
export const selectContentByTierLevel = (level: TierLevel) => (state: RootState) =>
  state.contentTiers.gatedContent.filter((c) => c.tierLevel === level);

// Get content by artist
export const selectContentByArtist = (artistId: string) => (state: RootState) =>
  state.contentTiers.gatedContent.filter((c) => c.artistId === artistId);

// Get accessible content by artist
export const selectAccessibleContentByArtist = (artistId: string) => (state: RootState) =>
  state.contentTiers.accessibleContent.filter((c) => c.artistId === artistId);
