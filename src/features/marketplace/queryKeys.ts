export const marketplaceKeys = {
  all: ['marketplace'] as const,
  lists: () => [...marketplaceKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [...marketplaceKeys.lists(), filters] as const,
  details: () => [...marketplaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...marketplaceKeys.details(), id] as const,
}
