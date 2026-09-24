import { useState } from 'react'
import { Button } from '@/components/ui'
import { truncateMiddle } from '@/lib'
import { useWallet } from '../hooks/useWallet'
import WalletPickerModal from './WalletPickerModal'

/**
 * Navbar entry point for wallet-based auth: opens the wallet picker, then shows
 * the connected address in truncated form.
 */
export default function ConnectWalletButton() {
  const [isPickerOpen, setPickerOpen] = useState(false)
  const { publicKey, connectedWalletName, hasNetworkMismatch, expectedNetworkLabel } = useWallet()

  const title = publicKey
    ? hasNetworkMismatch
      ? `${connectedWalletName} is on the wrong network - switch to ${expectedNetworkLabel}`
      : `Connected with ${connectedWalletName}`
    : 'Connect a Stellar wallet'

  return (
    <>
      <Button variant="secondary" size="sm" title={title} onClick={() => setPickerOpen(true)}>
        {hasNetworkMismatch ? (
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-warning" />
        ) : null}
        {publicKey ? truncateMiddle(publicKey) : 'Connect wallet'}
      </Button>
      <WalletPickerModal isOpen={isPickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  )
}
