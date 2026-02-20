import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { AuthStore } from '@/types';

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial State
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        // Actions
        login: (user, token) =>
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          }),

        logout: () =>
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          }),

        setUser: (user) => set({ user }),

        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        // Only persist these fields
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
);
