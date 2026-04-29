// User Types
export type UserRole = "admin" | "user" | "moderator" | "creator";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: UserRole;
  googleLinked?: boolean;
  githubLinked?: boolean;
}

// Auth Store Types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setTokens: (token: string, refreshToken: string) => void;
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

// Audit Log Types
export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_SUSPENDED'
  | 'USER_UNSUSPENDED'
  | 'USER_DELETED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_APPROVED'
  | 'PROJECT_REJECTED'
  | 'PROJECT_DELETED'
  | 'DONATION_PROCESSED'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'WITHDRAWAL_PROCESSED'
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'SETTINGS_UPDATED'
  | 'REPORT_GENERATED';

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: AuditAction;
  targetId?: string;
  targetType?: string;
  targetName?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}

// UI Store Types
export type ModalType = "login" | "wallet" | "settings" | null;

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export interface UIState {
  activeModal: ModalType;
  notifications: Notification[];
  isSidebarOpen: boolean;
  theme: "light" | "dark";
  isGlobalLoading: boolean;
}

export interface UIActions {
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setGlobalLoading: (isLoading: boolean) => void;
}

export type UIStore = UIState & UIActions;

// Notification Types
export type NotificationType = "donation" | "campaign_update" | "admin_message" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
}

export interface NotificationActions {
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<AppNotification, "id" | "createdAt">) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  setLoading: (loading: boolean) => void;
}

export type NotificationStore = NotificationState & NotificationActions;

// Stellar Types
export type StellarNetworkType = "testnet" | "public" | "futurenet";

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
  status: "pending" | "completed" | "failed";
}

export interface ConnectionStatus {
  connected: boolean;
  network: StellarNetworkType;
  horizonUrl: string;
  lastError?: string;
}
