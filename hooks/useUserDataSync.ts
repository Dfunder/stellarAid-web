'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { userDataApi } from '@/lib/api/userData';
import type { ProjectDraft } from '@/hooks/useDraftManager';
import type { UserDataSnapshot, UserPreferences } from '@/types/userData';

const BOOKMARKS_KEY = 'stellar-aid-bookmarks';
const DRAFTS_KEY = 'project_drafts';
const THEME_KEY = 'stellaraid-theme';
const ANALYTICS_KEY = 'analytics_consent';

function parseStoredBookmarks(): string[] {
  const raw = localStorage.getItem(BOOKMARKS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as { state?: { bookmarkedIds?: string[] } };
    return parsed.state?.bookmarkedIds ?? [];
  } catch {
    return [];
  }
}

function persistBookmarks(bookmarks: string[]): void {
  localStorage.setItem(
    BOOKMARKS_KEY,
    JSON.stringify({
      state: { bookmarkedIds: bookmarks, isLoading: false },
      version: 0,
    })
  );
  useBookmarkStore.setState({ bookmarkedIds: bookmarks });
}

function parseStoredDrafts(): ProjectDraft[] {
  const raw = localStorage.getItem(DRAFTS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ProjectDraft[];
  } catch {
    return [];
  }
}

function persistDrafts(drafts: ProjectDraft[]): void {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

function readPreferences(): UserPreferences {
  const theme = localStorage.getItem(THEME_KEY);
  const analyticsConsent = localStorage.getItem(ANALYTICS_KEY);

  return {
    theme: theme === 'light' || theme === 'dark' ? theme : 'system',
    analyticsConsent:
      analyticsConsent === null
        ? null
        : analyticsConsent === 'true',
  };
}

function persistPreferences(preferences: UserPreferences): void {
  localStorage.setItem(THEME_KEY, preferences.theme);

  if (preferences.analyticsConsent === null) {
    localStorage.removeItem(ANALYTICS_KEY);
  } else {
    localStorage.setItem(ANALYTICS_KEY, String(preferences.analyticsConsent));
  }
}

function readLocalSnapshot(walletAddress: string): UserDataSnapshot {
  return {
    walletAddress,
    bookmarks: parseStoredBookmarks(),
    drafts: parseStoredDrafts(),
    preferences: readPreferences(),
    updatedAt: new Date().toISOString(),
  };
}

function mergeSnapshots(local: UserDataSnapshot, remote: UserDataSnapshot | null): UserDataSnapshot {
  if (!remote) {
    return local;
  }

  const draftMap = new Map<string, ProjectDraft>();
  for (const draft of remote.drafts) {
    draftMap.set(draft.id, draft);
  }
  for (const draft of local.drafts) {
    const existing = draftMap.get(draft.id);
    if (!existing || new Date(draft.updatedAt) >= new Date(existing.updatedAt)) {
      draftMap.set(draft.id, draft);
    }
  }

  return {
    walletAddress: local.walletAddress,
    bookmarks: Array.from(new Set([...remote.bookmarks, ...local.bookmarks])),
    drafts: Array.from(draftMap.values()).sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    ),
    preferences: {
      theme: local.preferences.theme ?? remote.preferences.theme,
      analyticsConsent:
        local.preferences.analyticsConsent ?? remote.preferences.analyticsConsent,
    },
    updatedAt:
      new Date(local.updatedAt) >= new Date(remote.updatedAt) ? local.updatedAt : remote.updatedAt,
  };
}

function hydrateSnapshot(snapshot: UserDataSnapshot): void {
  persistBookmarks(snapshot.bookmarks);
  persistDrafts(snapshot.drafts);
  persistPreferences(snapshot.preferences);
}

export function useUserDataSync(walletAddress: string | null) {
  const isSyncingRef = useRef(false);

  const syncNow = useCallback(async () => {
    if (!walletAddress || typeof window === 'undefined' || !navigator.onLine || isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;

    try {
      const localSnapshot = readLocalSnapshot(walletAddress);
      const remoteSnapshot = await userDataApi.get(walletAddress);
      const mergedSnapshot = mergeSnapshots(localSnapshot, remoteSnapshot);

      const savedSnapshot = await userDataApi.save(walletAddress, {
        bookmarks: mergedSnapshot.bookmarks,
        drafts: mergedSnapshot.drafts,
        preferences: mergedSnapshot.preferences,
      });

      hydrateSnapshot(savedSnapshot);
    } catch (error) {
      console.error('Failed to sync user data:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [walletAddress]);

  const deleteRemoteData = useCallback(async () => {
    if (!walletAddress) {
      return;
    }

    await userDataApi.remove(walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    syncNow();

    const handleReconnect = () => {
      void syncNow();
    };

    window.addEventListener('online', handleReconnect);
    return () => {
      window.removeEventListener('online', handleReconnect);
    };
  }, [syncNow, walletAddress]);

  return {
    syncNow,
    deleteRemoteData,
  };
}
