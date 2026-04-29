import type { ProjectDraft } from '@/hooks/useDraftManager';
import type { UserDataSnapshot, UserPreferences } from '@/types/userData';

interface UserDataPayload {
  bookmarks: string[];
  drafts: ProjectDraft[];
  preferences: UserPreferences;
}

async function requestUserData<T>(
  walletAddress: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch('/api/user-data', {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-wallet-address': walletAddress,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`User data request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { data: T };
  return payload.data;
}

export const userDataApi = {
  get: async (walletAddress: string): Promise<UserDataSnapshot | null> => {
    return requestUserData<UserDataSnapshot | null>(walletAddress);
  },
  save: async (walletAddress: string, payload: UserDataPayload): Promise<UserDataSnapshot> => {
    return requestUserData<UserDataSnapshot>(walletAddress, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  remove: async (walletAddress: string): Promise<void> => {
    await requestUserData<{ deleted: true }>(walletAddress, {
      method: 'DELETE',
    });
  },
};
