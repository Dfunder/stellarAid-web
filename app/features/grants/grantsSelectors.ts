'use client';

import { RootState } from '@/app/store';
import { GrantStatus, ApplicationStatus } from './grantsSlice';

// ============================================================
// Grant Selectors
// ============================================================

export const selectGrants = (state: RootState) => state.grants.grants;
export const selectCurrentGrant = (state: RootState) => state.grants.currentGrant;
export const selectGrantsLoading = (state: RootState) => state.grants.loading;
export const selectGrantsError = (state: RootState) => state.grants.error;

// Filter grants by status
export const selectOpenGrants = (state: RootState) =>
  state.grants.grants.filter((g) => g.status === 'open');

export const selectVotingGrants = (state: RootState) =>
  state.grants.grants.filter((g) => g.status === 'voting');

export const selectClosedGrants = (state: RootState) =>
  state.grants.grants.filter((g) => g.status === 'closed');

export const selectAwardedGrants = (state: RootState) =>
  state.grants.grants.filter((g) => g.status === 'awarded' || g.status === 'distributed');

// ============================================================
// Application Selectors
// ============================================================

export const selectApplications = (state: RootState) => state.grants.applications;
export const selectCurrentApplication = (state: RootState) => state.grants.currentApplication;
export const selectUserApplications = (state: RootState) => state.grants.userApplications;

// Filter applications by status
export const selectPendingApplications = (state: RootState) =>
  state.grants.applications.filter((a) => a.status === 'pending');

export const selectShortlistedApplications = (state: RootState) =>
  state.grants.applications.filter((a) => a.status === 'shortlisted');

export const selectApprovedApplications = (state: RootState) =>
  state.grants.applications.filter((a) => a.status === 'approved');

export const selectRejectedApplications = (state: RootState) =>
  state.grants.applications.filter((a) => a.status === 'rejected');

// Sort applications by votes (most upvotes first)
export const selectTopVotedApplications = (state: RootState) =>
  [...state.grants.applications].sort((a, b) => b.upvotes - a.upvotes);

// Check if user has applied to a specific grant
export const selectHasUserApplied = (grantId: string) => (state: RootState) =>
  state.grants.userApplications.some((a) => a.grantId === grantId);

// Get user's application for a specific grant
export const selectUserApplicationForGrant = (grantId: string) => (state: RootState) =>
  state.grants.userApplications.find((a) => a.grantId === grantId) || null;

// ============================================================
// Vote Selectors
// ============================================================

export const selectVotes = (state: RootState) => state.grants.votes;
export const selectUserVotes = (state: RootState) => state.grants.userVotes;

// Get user's vote for a specific application
export const selectUserVoteForApplication = (applicationId: string) => (state: RootState) =>
  state.grants.userVotes[applicationId] || null;

// Check if user has voted on a specific application
export const selectHasUserVoted = (applicationId: string) => (state: RootState) =>
  applicationId in state.grants.userVotes;

// ============================================================
// Recipient Selectors
// ============================================================

export const selectRecipients = (state: RootState) => state.grants.recipients;

// Filter recipients by status
export const selectPendingRecipients = (state: RootState) =>
  state.grants.recipients.filter((r) => r.status === 'pending');

export const selectPartialRecipients = (state: RootState) =>
  state.grants.recipients.filter((r) => r.status === 'partial');

export const selectCompleteRecipients = (state: RootState) =>
  state.grants.recipients.filter((r) => r.status === 'complete');

// Get total distributed amount for a grant
export const selectTotalDistributed = (state: RootState) =>
  state.grants.recipients.reduce((sum, r) => sum + r.distributedAmount, 0);

// ============================================================
// Impact Selectors
// ============================================================

export const selectImpactMetrics = (state: RootState) => state.grants.impactMetrics;

// Get impact metrics for a specific recipient
export const selectImpactForRecipient = (recipientId: string) => (state: RootState) =>
  state.grants.impactMetrics.filter((m) => m.recipientId === recipientId);

// Get total impact value for a grant
export const selectTotalImpactValue = (grantId: string) => (state: RootState) =>
  state.grants.impactMetrics
    .filter((m) => m.grantId === grantId)
    .reduce((sum, m) => sum + m.metricValue, 0);
