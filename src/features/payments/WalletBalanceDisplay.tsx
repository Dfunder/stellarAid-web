import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, ExplorerLink } from '@/components/ui'
import { http } from '@/services'
import { useWallet } from '@/features/auth/hooks/useWallet'
import { formatDate } from '@/lib'

interface AssetBalance {
  asset: string
  balance: string
  hasTrustline: boolean
  trustlineLimit?: string
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

interface WalletBalanceDisplayProps {
  /** Assets to display balances for */
  assets?: string[]
  /** Show as dropdown in navbar */
  asDropdown?: boolean
  /** Custom className */
  className?: string
}

export default function WalletBalanceDisplay({
  assets = ['XLM', 'USDC', 'NGNT', 'EURC'],
  asDropdown = false,
  className = '',
}: WalletBalanceDisplayProps) {
  const { publicKey, isConnected } = useWallet()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const { data: balances, isPending, isError, refetch } = useQuery({
    queryKey: ['walletBalances', publicKey],
    queryFn: async (): Promise<AssetBalance[]> => {
      if (!publicKey) return []
      const response = await http.get<{ balances: AssetBalance[] }>(`/wallets/${publicKey}/balances`)
      return response.balances
    },
    enabled: !!publicKey,
    refetchOnWindowFocus: true,
  })

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (isConnected) void refetch()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isConnected, refetch])

  const filteredBalances = balances?.filter((b) => assets.includes(b.asset)) ?? []
  const missingTrustlines = filteredBalances.filter((b) => !b.hasTrustline)

  const totalUsdValue = filteredBalances.reduce((sum, b) => {
    // In a real app, you'd fetch conversion rates
    // For now, just show XLM equivalent or raw values
    return sum + parseFloat(b.balance)
  }, 0)

  if (!isConnected) {
    return (
      <div className={className}>
        <Button variant="ghost" size="sm" asChild>
          <a href="/settings/wallets">Connect wallet to see balances</a>
        </Button>
      </div>
    )
  }

  const renderBalanceItem = (balance: AssetBalance) => {
    const precision = ASSET_PRECISION[balance.asset] ?? 7
    const label = ASSET_LABELS[balance.asset] ?? balance.asset

    return (
      <div
        key={balance.asset}
        className={`flex items-center gap-3 rounded-card p-3 transition-colors ${
          balance.hasTrustline ? 'bg-surface' : 'bg-warning/10 border border-warning/30'
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-caption-sm font-medium text-foreground">{label}</span>
            {!balance.hasTrustline && (
              <span className="rounded-full bg-warning/20 px-1.5 py-0.5 text-caption-xs font-medium text-warning">
                No trustline
              </span>
            )}
          </div>
          <p className="mt-0.5 font-mono text-caption text-foreground">
            {parseFloat(balance.balance).toLocaleString(undefined, {
              minimumFractionDigits: precision,
              maximumFractionDigits: precision,
            })}
          </p>
        </div>
        {!balance.hasTrustline && balance.trustlineLimit && (
          <button
            type="button"
            className="text-caption-sm font-semibold text-primary hover:underline"
            onClick={() => {
              // Open trustline creation flow
            }}
          >
            Add trustline
          </button>
        )}
      </div>
    )
  }

  if (asDropdown) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 12V7H5" />
            <path d="M21 17H5" />
            <path d="M7 7v10" />
            <path d="M11 7v10" />
            <path d="M15 7v10" />
            <path d="M19 7v10" />
          </svg>
          <span className="font-mono text-caption-sm">
            {totalUsdValue.toFixed(2)}
          </span>
          <svg className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-64 rounded-card border border-line bg-surface p-3 shadow-card z-50"
              role="menu"
            >
              <div className="flex flex-col gap-1">
                {isPending ? (
                  <div className="flex items-center gap-2 py-4 text-muted">
                    <span className="animate-spin">⟳</span>
                    <span className="text-caption">Loading balances…</span>
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center gap-2 py-4 text-danger">
                    <p className="text-caption">Failed to load balances</p>
                    <Button size="sm" variant="secondary" onClick={() => void refetch()}>
                      Try again
                    </Button>
                  </div>
                ) : filteredBalances.length === 0 ? (
                  <p className="text-caption text-muted py-4 text-center">No balances found</p>
                ) : (
                  filteredBalances.map(renderBalanceItem)
                )}
              </div>

              {missingTrustlines.length > 0 && (
                <div className="mt-3 pt-3 border-t border-line">
                  <p className="text-caption-xs text-muted mb-2">
                    Some assets need trustlines to receive payments.
                  </p>
                  <Button size="sm" variant="secondary" className="w-full" asChild>
                    <a href="/settings/wallets">Manage trustlines</a>
                  </Button>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-line flex items-center gap-2">
                <Button size="sm" variant="ghost" className="flex-1" onClick={() => void refetch()}>
                  Refresh
                </Button>
                <Button size="sm" variant="ghost" className="flex-1" asChild>
                  <a href="/settings/wallets">Manage</a>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-caption-sm font-semibold text-foreground">Wallet Balances</h3>
        <Button size="sm" variant="ghost" onClick={() => void refetch()}>
          Refresh
        </Button>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-4 text-muted">
          <span className="animate-spin">⟳</span>
          <span className="text-caption">Loading balances…</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-4 rounded-control bg-danger/10 p-4">
          <p className="text-caption text-danger">Failed to load balances</p>
          <Button size="sm" variant="secondary" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : filteredBalances.length === 0 ? (
        <p className="text-caption text-muted py-4 text-center">No balances found for selected assets</p>
      ) : (
        filteredBalances.map(renderBalanceItem)
      )}

      {missingTrustlines.length > 0 && (
        <div className="mt-2 rounded-control bg-warning/10 p-3">
          <p className="text-caption-sm text-warning">
            {missingTrustlines.length} asset{missingTrustlines.length > 1 ? 's' : ''} missing trustline{missingTrustlines.length > 1 ? 's' : ''}.
          </p>
          <Button size="sm" variant="secondary" className="mt-2" asChild>
            <a href="/settings/wallets">Add trustlines</a>
          </Button>
        </div>
      )}
    </div>
  )
}