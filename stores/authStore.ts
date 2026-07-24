import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  role: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  role: null,
  login: (user, token) =>
    set({ user, accessToken: token, isAuthenticated: true, role: user.role || null }),
  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, role: null }),
  setUser: (user) =>
    set({ user, role: user.role || null }),
}));
