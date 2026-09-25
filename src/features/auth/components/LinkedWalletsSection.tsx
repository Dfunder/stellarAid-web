import { useState } from 'react'
import { stellarAccountExplorerUrl, STELLAR_NETWORK_LABELS } from '@/config'
import { Button, Modal, Spinner } from '@/components/ui'
import { useCopyToClipboard } from '@/hooks'
import { truncateMiddle } from '@/lib'
import { getErrorMessage } from '@/services'
import {
  useLinkedWallets,
  useLinkWallet,
  useSetWalletVisibility,
  useUnlinkWallet,
} from '../hooks/useLinkedWallets'
import { useWallet } from '../hooks/useWallet'
import type { LinkedWallet } from '../types'
import ConnectWalletButton from './ConnectWalletButton'

const ACTION_CLASSES = 'text-caption-sm font-semibold text-primary hover:underline'

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString()
}

/**
 * Settings section that lists the Stellar addresses linked to the account and
 * drives the link / unlink flows.
 *
 * Linking proves ownership: the backend issues a challenge, the connected wallet
 * signs it, and only `{ publicKey, signedChallenge }` is submitted.
 */
export default function LinkedWalletsSection() {
  const { publicKey, hasNetworkMismatch, expectedNetworkLabel } = useWallet()
  const { data: wallets, isPending, isError, error, refetch } = useLinkedWallets()
  const linkWallet = useLinkWallet()
  const unlinkWallet = useUnlinkWallet()
  const setVisibility = useSetWalletVisibility()
  const { copy, isCopied } = useCopyToClipboard()
  const [pendingUnlink, setPendingUnlink] = useState<LinkedWallet | null>(null)

  const linkedWallets = wallets ?? []
  const isAlreadyLinked = linkedWallets.some((wallet) => wallet.publicKey === publicKey)
  const isLinking = linkWallet.isPending

  const handleConfirmUnlink = async (): Promise<void> => {
    if (!pendingUnlink) return
    try {
      await unlinkWallet.mutateAsync(pendingUnlink.id)
      setPendingUnlink(null)
    } catch {
      // The failure message stays visible inside the confirmation dialog.
    }
  }

  return (
    <section className="rounded-card border border-line bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-h3">Payout wallets</h2>
          <p className="mt-1 max-w-xl text-caption text-muted">
            Link a Stellar address to receive payouts. We ask your wallet to sign a one-time message
            so only the owner of an address can link it.
          </p>
        </div>
        <ConnectWalletButton />
      </div>

      {hasNetworkMismatch ? (
        <p
          role="alert"
          className="mt-5 rounded-control bg-warning/15 p-3 text-caption text-warning"
        >
          Your wallet is on a different network. Switch it to {expectedNetworkLabel} before linking.
        </p>
      ) : null}

      {linkWallet.isError ? (
        <p role="alert" className="mt-5 rounded-control bg-danger/10 p-3 text-caption text-danger">
          {getErrorMessage(linkWallet.error)}
        </p>
      ) : null}

      <div className="mt-5">
        {isPending ? (
          <div className="flex items-center gap-3 py-8 text-muted">
            <Spinner label="Loading linked wallets" className="h-5 w-5" />
            <span className="text-caption">Loading your linked wallets…</span>
          </div>
        ) : isError ? (
          <div className="flex flex-wrap items-center gap-3 rounded-control bg-danger/10 p-4">
            <p role="alert" className="text-caption text-danger">
              {getErrorMessage(error)}
            </p>
            <Button size="sm" variant="secondary" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : linkedWallets.length === 0 ? (
          <p className="rounded-control bg-surface-muted p-4 text-caption text-muted">
            No wallets linked yet. Connect a wallet above, then sign the ownership challenge to link
            it.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {linkedWallets.map((wallet) => (
              <li
                key={wallet.id}
                className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-all text-caption font-semibold text-foreground">
                      {truncateMiddle(wallet.publicKey, 10, 8)}
                    </span>
                    {wallet.isPrimary ? (
                      <span className="rounded-control bg-primary/10 px-2 py-0.5 text-caption-sm font-semibold text-primary">
                        Primary
                      </span>
                    ) : null}
                    <span className="rounded-control bg-surface-muted px-2 py-0.5 text-caption-sm text-muted">
                      {STELLAR_NETWORK_LABELS[wallet.network]}
                    </span>
                  </div>
                  <p className="mt-1 break-all text-caption-sm text-muted" title={wallet.publicKey}>
                    Linked {formatDate(wallet.linkedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-caption-sm text-muted">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={wallet.isPublic}
                      disabled={setVisibility.isPending}
                      onChange={() =>
                        setVisibility.mutate({ walletId: wallet.id, isPublic: !wallet.isPublic })
                      }
                    />
                    Show on profile
                  </label>
                  <button
                    type="button"
                    className={ACTION_CLASSES}
                    onClick={() => void copy(wallet.publicKey)}
                  >
                    {isCopied(wallet.publicKey) ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={stellarAccountExplorerUrl(wallet.publicKey, wallet.network)}
                    target="_blank"
                    rel="noreferrer"
                    className={ACTION_CLASSES}
                  >
                    Explorer
                  </a>
                  <button
                    type="button"
                    className="text-caption-sm font-semibold text-danger hover:underline"
                    onClick={() => setPendingUnlink(wallet)}
                  >
                    Unlink
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        {publicKey ? (
          <>
            <Button
              isLoading={isLinking}
              disabled={hasNetworkMismatch || isAlreadyLinked}
              onClick={() => linkWallet.mutate()}
            >
              {isAlreadyLinked ? 'Address already linked' : 'Sign and link this address'}
            </Button>
            <span className="break-all text-caption-sm text-muted" title={publicKey}>
              {truncateMiddle(publicKey, 10, 8)}
            </span>
          </>
        ) : (
          <p className="text-caption text-muted">
            Connect a wallet to link its address. You will be asked to sign a short message.
          </p>
        )}
      </div>

      <Modal
        isOpen={pendingUnlink !== null}
        onClose={() => setPendingUnlink(null)}
        title="Unlink this address?"
        description="Payouts to this address will stop until you link it again."
      >
        <p className="break-all rounded-control bg-surface-muted p-3 text-caption-sm text-foreground">
          {pendingUnlink?.publicKey}
        </p>

        {unlinkWallet.isError ? (
          <p
            role="alert"
            className="mt-4 rounded-control bg-danger/10 p-3 text-caption text-danger"
          >
            {getErrorMessage(unlinkWallet.error)}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPendingUnlink(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={unlinkWallet.isPending}
            onClick={() => void handleConfirmUnlink()}
          >
            Unlink address
          </Button>
        </div>
      </Modal>
    </section>
  )
}
