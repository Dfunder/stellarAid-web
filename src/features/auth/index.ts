/**
 * Auth feature.
 *
 * Wallet-based authentication, sign-up/sign-in flows, and session handling.
 * This barrel is the feature's public API; everything else stays private.
 */
export { default as AuthLayout } from './components/AuthLayout'
export { default as ForgotPasswordPage } from './components/ForgotPasswordPage'
export { default as GuestRoute } from './components/GuestRoute'
export { default as LoginPage } from './components/LoginPage'
export { default as ProtectedRoute } from './components/ProtectedRoute'
export { default as RegisterPage } from './components/RegisterPage'
export { default as ResetPasswordPage } from './components/ResetPasswordPage'
export { default as VerifyEmailPage } from './components/VerifyEmailPage'
export { useAuthStore } from './stores/useAuthStore'
export type { AuthSession } from './types'
