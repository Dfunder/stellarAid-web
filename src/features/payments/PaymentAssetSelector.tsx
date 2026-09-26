import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, ExplorerLink } from '@/components/ui'
import { http } from '@/services'
import { useWallet } from '@/features/auth/hooks/useWallet'
import { formatDate } from '@/lib'

interface AssetBalance {
  asset: string
  balance: string
  hasTrustline: boolean
}

interface PaymentAssetSelectorProps {
  /** Artwork price in base asset (XLM) */
  price: string
  /** Assets accepted by the seller */
  acceptedAssets: string[]
  /** Called when user selects an asset */
  onSelect: (asset: string) => void
  /** Currently selected asset */
  selectedAsset: string
  /** Whether the selector is disabled */
  disabled?: boolean
}

const ASSET_LABELS: Record<string, string> = {
  XLM: 'XLM (Native)',
  USDC: 'USDC',
  NGNT: 'NGNT',
  EURC: 'EURC',
}

const ASSET_PRECISION: Record<string, number> = {
  XLM: 7,
  USDC: 2,
  NGNT: 2,
  EURC: 2,
}

export default function PaymentAssetSelector({
  price,
  acceptedAssets,
  onSelect,
  selectedAsset,
  disabled = false,
}: PaymentAssetSelectorProps) {
  const { publicKey } = useWallet()
  const [warning, setWarning] = useState<string | null>(null)

  const { data: balances } = useQuery({
    queryKey: ['walletBalances', publicKey],
    queryFn: async (): Promise<AssetBalance[]> => {
      if (!publicKey) return []
      const response = await http.get<{ balances: AssetBalance[] }>(`/wallets/${publicKey}/balances`)
      return response.balances
    },
    enabled: !!publicKey,
  })

  // Check balance when selected asset changes
  useEffect(() => {
    if (!selectedAsset || !balances) {
      setWarning(null)
      return
    }
    const balance = balances.find((b) => b.asset === selectedAsset)
    if (!balance) {
      setWarning(`No balance data for ${selectedAsset}`)
      return
    }
    if (!balance.hasTrustline) {
      setWarning(`Trustline missing for ${selectedAsset}. Add it in your wallet first.`)
      return
    }
    const required = parseFloat(price)
    const available = parseFloat(balance.balance)
    if (available < required) {
      setWarning(`Insufficient ${selectedAsset} balance. Need ${price}, have ${balance.balance}`)
      return
    }
    setWarning(null)
  }, [selectedAsset, balances, price])

  const availableAssets = acceptedAssets.filter((asset) => {
    if (!balances) return true
    const balance = balances.find((b) => b.asset === asset)
    return balance && balance.hasTrustline
  })

  const handleSelect = (asset: string) => {
    if (disabled) return
    const balance = balances?.find((b) => b.asset === asset)
    if (balance && !balance.hasTrustline) {
      setWarning(`Trustline missing for ${asset}. Add it in your wallet first.`)
      return
    }
    onSelect(asset)
  }

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <label className="block text-caption-sm font-medium text-foreground mb-2">
        Pay with
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {availableAssets.map((asset) => {
          const balance = balances?.find((b) => b.asset === asset)
          const precision = ASSET_PRECISION[asset] ?? 7
          const isSelected = selectedAsset === asset
          const hasBalance = balance && parseFloat(balance.balance) >= parseFloat(price)
          const isDisabled = disabled || !balance || !balance.hasTrustline || !hasBalance

          return (
            <button
              key={asset}
              type="button"
              onClick={() => handleSelect(asset)}
              disabled={isDisabled}
              className={`flex items-center gap-2 rounded-control px-3 py-2 text-caption-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-contrast ring-2 ring-primary ring-offset-2 ring-offset-surface'
                  : 'bg-surface-muted text-foreground hover:bg-surface border border-line'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{ASSET_LABELS[asset] ?? asset}</span>
              {balance && (
                <span className="font-mono text-caption-xs text-muted">
                  {parseFloat(balance.balance).toLocaleString(undefined, {
                    minimumFractionDigits: precision,
                    maximumFractionDigits: precision,
                  })}
                </span>
              )}
              {isSelected && (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {warning && (
        <p className="mt-2 text-caption-sm text-danger flex items-center gap-1" role="alert">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {warning}
        </p>
      )}

      {acceptedAssets.length > availableAssets.length && (
        <p className="mt-2 text-caption-xs text-muted">
          Some accepted assets are not available in your wallet.
        </p>
      )}
    </div>
  )
}