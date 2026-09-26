/**
 * Auth feature.
 *
 * Wallet-based authentication, sign-up/sign-in flows, and session handling.
 * This barrel is the feature's public API; everything else stays private.
 */
export { default as AccountMenu } from './components/AccountMenu'
export { default as AuthLayout } from './components/AuthLayout'
export { default as AuthLoader } from './components/AuthLoader'
export { default as AuthProvider } from './components/AuthProvider'
export { default as ConnectWalletButton } from './components/ConnectWalletButton'
export { default as ForgotPasswordPage } from './components/ForgotPasswordPage'
export { default as GuestRoute } from './components/GuestRoute'
export { default as LinkedWalletsSection } from './components/LinkedWalletsSection'
export { default as LoginPage } from './components/LoginPage'
export { default as ProtectedRoute } from './components/ProtectedRoute'
export { default as PublicWalletAddress } from './components/PublicWalletAddress'
export { default as RegisterPage } from './components/RegisterPage'
export { default as RequireAuth } from './components/RequireAuth'
export { default as ResetPasswordPage } from './components/ResetPasswordPage'
export { default as SignInPage } from './components/SignInPage'
export { default as VerifyEmailPage } from './components/VerifyEmailPage'
export { default as WalletAuthModal } from './components/WalletAuthModal'
export { default as WalletPickerModal } from './components/WalletPickerModal'
export { default as WalletSettingsPage } from './components/WalletSettingsPage'

export { useAuth } from './hooks/useAuth'
export type { UseAuth } from './hooks/useAuth'
export { useAuthHydrated } from './hooks/useAuthHydrated'
export {
  linkedWalletsKey,
  useLinkedWallets,
  useLinkWallet,
  useSetWalletVisibility,
  useUnlinkWallet,
} from './hooks/useLinkedWallets'
export { useWallet } from './hooks/useWallet'
export type { UseWallet, WalletOption } from './hooks/useWallet'
export { useWalletAuth } from './hooks/useWalletAuth'
export type { UseWalletAuth, WalletAuthOptions } from './hooks/useWalletAuth'

export { authApi } from './services/authApi'
export { authService } from './services/authService'
export { WalletError, isWalletError, walletAdapters } from './services/wallets'
export type { WalletAdapter, WalletErrorCode } from './services/wallets'

export { authStore, getAuthState, subscribeAuth } from './stores/authStore'
export { useAuthStore } from './stores/useAuthStore'
export { getWalletConnection, getWalletState, subscribeWallet, walletStore } from './stores/walletStore'

export type {
  AuthSession,
  AuthState,
  AuthTokens,
  LinkedWallet,
  LoginCredentials,
  ResetPasswordPayload,
  SessionStatus,
  User,
  UserRole,
  UserSocials,
  WalletChallenge,
  WalletLoginPayload,
  WalletNonceResponse,
  WalletRegisterPayload,
} from './types'
