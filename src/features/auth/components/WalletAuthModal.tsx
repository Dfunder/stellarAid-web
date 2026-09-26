import { useState, type FormEvent } from 'react'
import { Button, Modal, Spinner } from '@/components/ui'
import { truncateMiddle } from '@/lib'
import { useWallet } from '../hooks/useWallet'
import { useWalletAuth } from '../hooks/useWalletAuth'
import type { User } from '../types'

export interface WalletAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (user: User) => void
}

export default function WalletAuthModal({ isOpen, onClose, onSuccess }: WalletAuthModalProps) {
  const {
    options,
    isDetecting,
    isConnecting,
    publicKey,
    connectedWalletName,
    hasNetworkMismatch,
    expectedNetworkLabel,
    connect,
  } = useWallet()

  const {
    isSigningIn,
    isAccountRequired,
    error: authError,
    loginWithConnectedWallet,
    completeRegistration,
    cancel,
  } = useWalletAuth()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  const handleClose = () => {
    cancel()
    onClose()
  }

  const handleConnectAndSignIn = async (adapterId: string) => {
    const connectedAddress = await connect(adapterId)
    if (connectedAddress) {
      const user = await loginWithConnectedWallet()
      if (user) {
        onSuccess?.(user)
        handleClose()
      }
    }
  }

  const handleDirectSignIn = async () => {
    const user = await loginWithConnectedWallet()
    if (user) {
      onSuccess?.(user)
      handleClose()
    }
  }

  const handleCompleteRegistration = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const user = await completeRegistration({
      name: name.trim(),
      username: username.trim() || undefined,
      email: email.trim() || undefined,
    })
    if (user) {
      onSuccess?.(user)
      handleClose()
    }
  }

  const installedOptions = options.filter((opt) => opt.isInstalled)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isAccountRequired ? 'Welcome to Lumora' : 'Sign in with Wallet'}
      description={
        isAccountRequired
          ? 'Your wallet address is new to Lumora. Complete your profile to create an account.'
          : 'Sign a cryptographic nonce with your Stellar wallet to authenticate without a password.'
      }
    >
      {authError && (
        <p role="alert" className="mb-4 rounded-control bg-danger/10 p-3 text-caption text-danger">
          {authError}
        </p>
      )}

      {hasNetworkMismatch && (
        <p role="alert" className="mb-4 rounded-control bg-warning/15 p-3 text-caption text-warning">
          Your wallet is on a different network. Switch to {expectedNetworkLabel} before signing.
        </p>
      )}

      {isAccountRequired ? (
        <form onSubmit={handleCompleteRegistration} className="flex flex-col gap-4">
          <div className="rounded-control bg-surface-muted p-3 text-caption">
            <span className="text-muted">Connected Address: </span>
            <span className="font-semibold text-foreground break-all">{publicKey}</span>
          </div>

          <label className="flex flex-col gap-1 text-caption-sm font-semibold">
            Display Name *
            <input
              type="text"
              required
              placeholder="e.g. Satoshi Nakamoto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-control border border-line bg-surface px-3.5 py-2 text-body text-foreground focus-visible:shadow-focus-ring"
            />
          </label>

          <label className="flex flex-col gap-1 text-caption-sm font-semibold">
            Username (optional)
            <input
              type="text"
              placeholder="e.g. satoshi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-control border border-line bg-surface px-3.5 py-2 text-body text-foreground focus-visible:shadow-focus-ring"
            />
          </label>

          <label className="flex flex-col gap-1 text-caption-sm font-semibold">
            Email (optional, for notifications)
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-control border border-line bg-surface px-3.5 py-2 text-body text-foreground focus-visible:shadow-focus-ring"
            />
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSigningIn} disabled={!name.trim()}>
              Create Account & Sign In
            </Button>
          </div>
        </form>
      ) : isSigningIn ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <Spinner className="h-8 w-8 text-primary" />
          <div>
            <p className="text-body font-semibold">Awaiting Wallet Signature…</p>
            <p className="mt-1 text-caption text-muted">
              Please check your {connectedWalletName ?? 'wallet'} extension window to sign the login challenge.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={cancel} className="mt-2">
            Cancel
          </Button>
        </div>
      ) : publicKey ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-control border border-line bg-surface-muted p-4">
            <p className="text-caption text-muted">Connected with {connectedWalletName}</p>
            <p className="mt-1 text-caption-sm font-semibold break-all text-foreground">{publicKey}</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleDirectSignIn} disabled={hasNetworkMismatch}>
              Sign Message to Log In
            </Button>
          </div>
        </div>
      ) : isDetecting ? (
        <div className="flex items-center gap-3 py-6 text-muted">
          <Spinner label="Detecting wallets" className="h-5 w-5" />
          <span className="text-caption">Checking for installed Stellar wallets…</span>
        </div>
      ) : installedOptions.length === 0 ? (
        <div className="rounded-control bg-surface-muted p-4">
          <p className="text-body font-semibold">No Stellar wallet detected</p>
          <p className="mt-1 text-caption text-muted">
            Install a supported Stellar wallet extension like Freighter to enable passwordless wallet login.
          </p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {options.map((opt) => (
              <li key={opt.id}>
                <a
                  href={opt.installUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-caption font-semibold text-primary hover:underline"
                >
                  Install {opt.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-caption text-muted">Choose a wallet to connect and sign in:</p>
          <ul className="flex flex-col gap-2">
            {installedOptions.map((opt) => (
              <li
                key={opt.id}
                className="flex items-center justify-between rounded-control border border-line bg-surface p-3 transition hover:bg-surface-muted"
              >
                <div>
                  <p className="text-body font-semibold">{opt.name}</p>
                  <p className="text-caption-sm text-muted">Available in browser</p>
                </div>
                <Button
                  size="sm"
                  isLoading={isConnecting}
                  onClick={() => handleConnectAndSignIn(opt.id)}
                >
                  Connect & Sign In
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  )
}
