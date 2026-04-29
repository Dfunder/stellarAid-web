import type { ProjectDraft } from '@/hooks/useDraftManager';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: ThemePreference;
  analyticsConsent: boolean | null;
}

export interface UserDataSnapshot {
  walletAddress: string;
  bookmarks: string[];
  drafts: ProjectDraft[];
  preferences: UserPreferences;
  updatedAt: string;
}
