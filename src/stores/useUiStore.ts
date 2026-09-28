import { create } from 'zustand'

export type ToastTone = 'error' | 'success' | 'info'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

/** Max toasts kept in the viewport; the oldest are evicted first. */
export const MAX_TOASTS = 4

function createToastId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    // `crypto.randomUUID` is not available in all contexts (e.g. older TLS-less
    // local engines). Fall back to a timestamp-prefixed random id.
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }
}

interface UiState {
  toasts: Toast[]
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (message, tone = 'info') =>
    set((state) => {
      const next = [...state.toasts, { id: createToastId(), message, tone }]
      const trimmed = next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next
      return { toasts: trimmed }
    }),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))
