import { stellarAccountExplorerUrl } from '@/config'
import { useCopyToClipboard } from '@/hooks'
import { truncateMiddle } from '@/lib'
import type { LinkedWallet } from '../types'

export interface PublicWalletAddressProps {
  /** Wallets of the profile being viewed; only the public ones are rendered. */
  wallets: LinkedWallet[]
}

/**
 * Payout address block for a public artist profile.
 *
 * Renders nothing when the artist has not made any address public, so a profile
 * never leaks a linked-but-private wallet.
 */
export default function PublicWalletAddress({ wallets }: PublicWalletAddressProps) {
  const { copy, isCopied } = useCopyToClipboard()
  const publicWallets = wallets.filter((wallet) => wallet.isPublic)

  if (publicWallets.length === 0) return null

  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card">
      <h2 className="text-h4">Payout address</h2>
      <p className="mt-1 text-caption text-muted">
        Verified on-chain. Send Stellar assets to this address to support the artist directly.
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {publicWallets.map((wallet) => (
          <li key={wallet.id} className="flex flex-wrap items-center gap-3">
            <span className="break-all text-caption-sm text-foreground" title={wallet.publicKey}>
              {truncateMiddle(wallet.publicKey, 10, 8)}
            </span>
            <button
              type="button"
              onClick={() => void copy(wallet.publicKey)}
              className="text-caption-sm font-semibold text-primary hover:underline"
            >
              {isCopied(wallet.publicKey) ? 'Copied' : 'Copy'}
            </button>
            <a
              href={stellarAccountExplorerUrl(wallet.publicKey, wallet.network)}
              target="_blank"
              rel="noreferrer"
              className="text-caption-sm font-semibold text-primary hover:underline"
            >
              View on explorer
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
