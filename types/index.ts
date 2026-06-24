
export interface Milestone {
    id: number;
    title: string;
    status: 'unlocked' | 'locked' | 'pending' | 'released';
    amount: number;
    progress: number;
    goal: number;
  }

export type KycStatus = 'Not Started' | 'In Review' | 'Verified' | 'Rejected';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'donor' | 'creator';
  avatar?: string;
  bio?: string;
  location?: string;
  verified?: boolean;
  kycStatus: KycStatus;
}

export interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setTokens: (token: string, refreshToken?: string) => void;
  setKycStatus: (kycStatus: KycStatus) => void;
}