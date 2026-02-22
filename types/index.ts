// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Auth Store Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

// Wallet Store Types
export interface WalletState {
  connectedWallet: string | null;
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletActions {
  connect: (wallet: string, address: string) => void;
  disconnect: () => void;
  setBalance: (balance: string) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
}

export type WalletStore = WalletState & WalletActions;

// UI Store Types
export type ModalType = 'login' | 'wallet' | 'settings' | null;

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface UIState {
  activeModal: ModalType;
  notifications: Notification[];
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
}

export interface UIActions {
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export type UIStore = UIState & UIActions;

// Stellar Types
export type StellarNetworkType = 'testnet' | 'public' | 'futurenet';

export interface StellarAccount {
  address: string;
  balance: string;
  sequence: string;
  subentryCount: number;
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface StellarAsset {
  code: string;
  issuer: string | null;
  balance: string;
  limit?: string;
}

export interface StellarTransaction {
  id: string;
  source: string;
  destination: string;
  amount: string;
  asset: string;
  createdAt: string;
  memo?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface ConnectionStatus {
  connected: boolean;
  network: StellarNetworkType;
  horizonUrl: string;
  lastError?: string;
}
