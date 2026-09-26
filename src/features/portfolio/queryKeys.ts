export const portfolioKeys = {
  all: ['portfolio'] as const,
  detail: (userId: string) => [...portfolioKeys.all, userId] as const,
}
