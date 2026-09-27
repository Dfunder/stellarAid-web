import { create } from 'zustand'

export type ToastTone = 'error' | 'success' | 'info'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

interface UiState {
  toasts: Toast[]
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
}

const MAX_TOASTS = 4

function makeToastId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (message, tone = 'info') =>
    set((state) => {
      const next = [...state.toasts, { id: makeToastId(), message, tone }]
      // Evict the oldest toasts beyond the cap, not the newest.
      return { toasts: next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next }
    }),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))