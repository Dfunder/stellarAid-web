import { create } from 'zustand'

export type ToastTone = 'error' | 'success' | 'info'

/** Maximum number of toasts kept on screen at once (oldest evicted first). */
export const MAX_TOASTS = 4

export interface Toast {
  id: string
  message: string
  tone: ToastTone
  /** Monotonic sequence number, used to evict the oldest toast when at capacity. */
  createdAt: number
}

interface UiState {
  theme: 'light' | 'dark'
  isMobileMenuOpen: boolean
  activeModal: string | null
  toasts: Toast[]
  _toastSeq: number
  setTheme: (theme: 'light' | 'dark') => void
  setMobileMenuOpen: (open: boolean) => void
  openModal: (modal: string) => void
  closeModal: () => void
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  isMobileMenuOpen: false,
  activeModal: null,
  toasts: [],
  _toastSeq: 0,
  setTheme: (theme) => set({ theme }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
  pushToast: (message, tone = 'info') =>
    set((state) => {
      const createdAt = state._toastSeq + 1
      const toast: Toast = { id: crypto.randomUUID(), message, tone, createdAt }
      const toasts = [...state.toasts, toast]
      // Evict oldest-first (by creation time) when over capacity, never the newest.
      toasts.sort((a, b) => a.createdAt - b.createdAt)
      return {
        toasts: toasts.slice(-MAX_TOASTS),
        _toastSeq: createdAt,
      }
    }),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))