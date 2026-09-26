export const commissionKeys = {
  all: ['commissions'] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...commissionKeys.all, 'list', filters] as const,
  detail: (id: string) => [...commissionKeys.all, 'detail', id] as const,
}
