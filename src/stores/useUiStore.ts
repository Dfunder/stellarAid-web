import { create } from 'zustand'

export type ToastTone = 'error' | 'success' | 'info'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

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

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  isMobileMenuOpen: false,
  activeModal: null,
  toasts: [],
  setTheme: (theme) => set({ theme }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
  pushToast: (message, tone = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, tone }].slice(-4),
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))
