import { useAuth } from '../hooks/useAuth'
import LinkedWalletsSection from './LinkedWalletsSection'

/** Settings screen for the account ↔ Stellar address relationship. */
export default function WalletSettingsPage() {
  const { user } = useAuth()

  return (
    <div className="container flex flex-col gap-6 py-12">
      <div>
        <h1 className="text-h2">Wallet settings</h1>
        <p className="mt-1 text-caption text-muted">
          Signed in as {user?.email ?? 'your account'}. Manage the Stellar addresses that can
          receive your payouts.
        </p>
      </div>
      <LinkedWalletsSection />
    </div>
  )
}
