import { create } from 'zustand'

export type ToastTone = 'error' | 'success' | 'info'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
  /** How long this toast stays up. Defaults to {@link TOAST_DURATION_MS}. */
  duration?: number
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

/** Remaining ms per toast while paused, and when the current timer started. */
const remainingMs = new Map<string, number>()
const startedAt = new Map<string, number>()

/**
 * Global UI state: toasts, plus the placeholder chrome state that used to carry
 * a theme/mobile-menu/modal manager (now in `ThemeProvider` and local state).
 */
interface UiState {
  theme: 'light' | 'dark'
  isMobileMenuOpen: boolean
  activeModal: string | null
  toasts: Toast[]
  setTheme: (theme: 'light' | 'dark') => void
  setMobileMenuOpen: (open: boolean) => void
  openModal: (modal: string) => void
  closeModal: () => void
  pushToast: (message: string, tone?: ToastTone, duration?: number) => void
  dismissToast: (id: string) => void
  /** Freeze a toast's auto-dismiss timer, e.g. while the pointer is over it. */
  pauseToast: (id: string) => void
  /** Restart a paused toast's timer with whatever time it had left. */
  resumeToast: (id: string) => void
}

export const useUiStore = create<UiState>((set, get) => {
  const clearTimer = (id: string) => {
    const timer = dismissTimers.get(id)
    if (timer !== undefined) clearTimeout(timer)
    dismissTimers.delete(id)
  }

  const scheduleDismiss = (id: string, ms: number) => {
    clearTimer(id)
    remainingMs.set(id, ms)
    startedAt.set(id, Date.now())
    dismissTimers.set(
      id,
      setTimeout(() => {
        clearTimer(id)
        remainingMs.delete(id)
        startedAt.delete(id)
        get().dismissToast(id)
      }, ms),
    )
  }

  return {
    theme: 'light',
    isMobileMenuOpen: false,
    activeModal: null,
    toasts: [],
    setTheme: (theme) => set({ theme }),
    setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
    openModal: (activeModal) => set({ activeModal }),
    closeModal: () => set({ activeModal: null }),
    pushToast: (message, tone = 'info', duration = TOAST_DURATION_MS) => {
      const id = createToastId()
      set((state) => ({
        toasts: [...state.toasts, { id, message, tone, duration }].slice(-MAX_TOASTS),
      }))
      scheduleDismiss(id, duration)
    },
    dismissToast: (id) => {
      clearTimer(id)
      remainingMs.delete(id)
      startedAt.delete(id)
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
    },
    pauseToast: (id) => {
      if (!dismissTimers.has(id)) return
      const started = startedAt.get(id)
      const left = remainingMs.get(id) ?? TOAST_DURATION_MS
      clearTimer(id)
      remainingMs.set(id, started === undefined ? left : Math.max(0, left - (Date.now() - started)))
    },
    resumeToast: (id) => {
      // Only restart a toast that is still on screen and genuinely paused.
      if (!get().toasts.some((toast) => toast.id === id)) return
      if (!remainingMs.has(id)) return
      scheduleDismiss(id, remainingMs.get(id) ?? TOAST_DURATION_MS)
    },
  }
})
