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
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,

        // Actions
        login: (user, token, refreshToken) =>
          set({
            user,
            token,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
          }),

        logout: () =>
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          }),

        setUser: (user) => set({ user }),

        setLoading: (loading) => set({ isLoading: loading }),

        setTokens: (token, refreshToken) =>
          set({
            token,
            refreshToken,
            isAuthenticated: true,
          }),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        // Only persist these fields
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
);
