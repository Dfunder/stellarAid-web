export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [...transactionKeys.lists(), filters] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
}