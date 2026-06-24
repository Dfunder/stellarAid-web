import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { AuthStore, KycStatus } from '@/types';

const setAuthCookie = (token: string) => {
  if (typeof window === 'undefined') return;
  const sessionOnly = sessionStorage.getItem('stellaraid-session-only') === 'true';
  const days = sessionOnly ? undefined : 30;
  
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = "token=" + encodeURIComponent(token) + expires + "; path=/; SameSite=Lax; Secure";
};

const deleteAuthCookie = () => {
  if (typeof window === 'undefined') return;
  document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure";
};

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
        login: (user, token, refreshToken) => {
          set({
            user,
            token,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
          });
          setAuthCookie(token);
        },

        logout: () => {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          deleteAuthCookie();
        },

        setUser: (user) => set({ user }),

        setLoading: (loading) => set({ isLoading: loading }),

        setTokens: (token, refreshToken) => {
          set({
            token,
            refreshToken,
            isAuthenticated: true,
          });
          setAuthCookie(token);
        },

        setKycStatus: (kycStatus) => {
          set((state) => ({
            user: state.user ? { ...state.user, kycStatus } : null,
          }));
        },
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
        onRehydrateStorage: () => (state) => {
          if (state?.token) {
            setAuthCookie(state.token);
          }
        },
      }
    ),
    {
      name: 'AuthStore',
    }
  )
);