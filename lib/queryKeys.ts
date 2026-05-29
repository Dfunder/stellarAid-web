/**
 * Query keys factory — centralised, typed keys for React Query.
 * Import and use these instead of inline string arrays.
 */
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['projects', 'list', filters] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
  },
  campaigns: {
    all: ['campaigns'] as const,
    list: () => ['campaigns', 'list'] as const,
    detail: (id: string) => ['campaigns', 'detail', id] as const,
  },
  user: {
    all: ['user'] as const,
    profile: (address: string) => ['user', 'profile', address] as const,
    donations: (address: string) => ['user', 'donations', address] as const,
  },
} as const;