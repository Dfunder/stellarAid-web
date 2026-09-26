export const messageKeys = {
  all: ['messages'] as const,
  thread: (id: string) => [...messageKeys.all, 'thread', id] as const,
}
