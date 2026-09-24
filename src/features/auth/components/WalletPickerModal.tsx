import { Button, Modal, Spinner } from '@/components/ui'
import { useCopyToClipboard } from '@/hooks'
import { useWallet, type WalletOption } from '../hooks/useWallet'

export interface WalletPickerModalProps {
  isOpen: boolean
  onClose: () => void
}

const INSTALL_LINK_CLASSES = 'text-caption font-semibold text-primary hover:underline'

/** Shown when no supported wallet extension was detected. */
function NoWalletGuidance({ options }: { options: WalletOption[] }) {
  return (
    <div className="rounded-control bg-surface-muted p-4">
      <p className="text-body font-semibold">No Stellar wallet detected</p>
      <p className="mt-1 text-caption text-muted">
        Lumora connects through a browser wallet extension. Install one, reload this page, then try
        again.
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {options.map((option) => (
          <li key={option.id}>
            <a
              href={option.installUrl}
              target="_blank"
              rel="noreferrer"
              className={INSTALL_LINK_CLASSES}
            >
              Install {option.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Wallet chooser: lists detected extensions, or explains how to get one. */
export default function WalletPickerModal({ isOpen, onClose }: WalletPickerModalProps) {
  const {
    options,
    isDetecting,
    isConnecting,
    publicKey,
    connectedWalletName,
    hasNetworkMismatch,
    expectedNetworkLabel,
    error,
    connect,
    disconnect,
  } = useWallet()
  const { copy, isCopied } = useCopyToClipboard()

  const installedOptions = options.filter((option) => option.isInstalled)
  const missingOptions = options.filter((option) => !option.isInstalled)

  const handleConnect = async (adapterId: string): Promise<void> => {
    if (await connect(adapterId)) onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={publicKey ? 'Your wallet' : 'Connect a wallet'}
      description={
        publicKey
          ? 'This is the address Lumora will use for signatures and payouts.'
          : 'Choose a Stellar wallet extension to continue.'
      }
    >
      {error ? (
        <p role="alert" className="mb-4 rounded-control bg-danger/10 p-3 text-caption text-danger">
          {error}
        </p>
      ) : null}

      {hasNetworkMismatch ? (
        <p
          role="alert"
          className="mb-4 rounded-control bg-warning/15 p-3 text-caption text-warning"
        >
          Your wallet is on a different network. Switch it to {expectedNetworkLabel} before signing.
        </p>
      ) : null}

      {publicKey ? (
        <div className="flex flex-col gap-4">
          <p className="text-caption text-muted">
            Connected with{' '}
            <span className="font-semibold text-foreground">{connectedWalletName}</span>
          </p>
          <p className="break-all rounded-control bg-surface-muted p-3 text-caption-sm text-foreground">
            {publicKey}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => void copy(publicKey)}>
              {isCopied(publicKey) ? 'Copied' : 'Copy address'}
            </Button>
            <Button size="sm" variant="ghost" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        </div>
      ) : isDetecting ? (
        <div className="flex items-center gap-3 py-6 text-muted">
          <Spinner label="Looking for wallets" className="h-5 w-5" />
          <span className="text-caption">Looking for installed wallets…</span>
        </div>
      ) : installedOptions.length === 0 ? (
        <NoWalletGuidance options={options} />
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {installedOptions.map((option) => (
              <li
                key={option.id}
                className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface p-3"
              >
                <div>
                  <p className="text-body font-semibold">{option.name}</p>
                  <p className="text-caption-sm text-muted">Detected in this browser</p>
                </div>
                <Button
                  size="sm"
                  isLoading={isConnecting}
                  onClick={() => void handleConnect(option.id)}
                >
                  Connect
                </Button>
              </li>
            ))}
          </ul>

          {missingOptions.length > 0 ? (
            <ul className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-3">
              {missingOptions.map((option) => (
                <li key={option.id} className="text-caption text-muted">
                  {option.name} not installed -{' '}
                  <a
                    href={option.installUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={INSTALL_LINK_CLASSES}
                  >
                    get it
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </Modal>
  )
}
