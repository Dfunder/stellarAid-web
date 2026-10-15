import { create } from 'zustand'

export type ToastTone = 'error' | 'success' | 'info'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

/** How long a toast stays on screen before it dismisses itself. */
export const TOAST_DURATION_MS = 5000

/** Newest toasts win: pushing past the cap drops the oldest toast. */
const MAX_TOASTS = 4

let toastCounter = 0

/**
 * Unique toast id. `crypto.randomUUID` throws on plain-HTTP origins (it is
 * only available in secure contexts), and a throw here would replace the real
 * error inside the axios interceptor that pushes the toast — so fall back to a
 * counter-based id instead.
 */
function createToastId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  toastCounter += 1
  return `toast-${Date.now().toString(36)}-${toastCounter.toString(36)}`
}

/** Auto-dismiss timers, keyed by toast id, so a manual dismiss can clear them. */
const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>()

interface UiState {
  theme: 'light' | 'dark'
  isMobileMenuOpen: boolean
  activeModal: string | null
  toasts: Toast[]
  setTheme: (theme: 'light' | 'dark') => void
  setMobileMenuOpen: (open: boolean) => void
  openModal: (modal: string) => void
  closeModal: () => void
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
}

export const useUiStore = create<UiState>((set, get) => ({
  theme: 'light',
  isMobileMenuOpen: false,
  activeModal: null,
  toasts: [],
  setTheme: (theme) => set({ theme }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
  pushToast: (message, tone = 'info') => {
    const id = createToastId()
    set((state) => ({
      toasts: [...state.toasts, { id, message, tone }].slice(-MAX_TOASTS),
    }))
    dismissTimers.set(
      id,
      setTimeout(() => {
        dismissTimers.delete(id)
        get().dismissToast(id)
      }, TOAST_DURATION_MS),
    )
  },
  dismissToast: (id) => {
    const timer = dismissTimers.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      dismissTimers.delete(id)
    }
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
  },
}))
