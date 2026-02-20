import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UIStore, Notification } from '@/types';

// Generate unique ID for notifications
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // Initial State
      activeModal: null,
      notifications: [],
      isSidebarOpen: false,
      theme: 'light',

      // Actions
      openModal: (modal) => set({ activeModal: modal }),

      closeModal: () => set({ activeModal: null }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: generateId() },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'UIStore',
    }
  )
);
