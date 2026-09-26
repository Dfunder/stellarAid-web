import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, ExplorerLink, Input, Modal, Spinner } from '@/components/ui'
import { http } from '@/services'
import { useAuth } from '@/features/auth'
import { formatDate } from '@/lib'
import type { LinkedWallet } from '@/features/auth/types'

interface Balance {
  available: string
  pending: string
  asset: string
}

interface WithdrawalRequest {
  amount: string
  asset: string
  walletId: string
}

interface WithdrawalHistoryItem {
  id: string
  amount: string
  asset: string
  status: 'pending' | 'completed' | 'failed'
  txHash: string | null
  destination: string
  createdAt: string
}

const ASSET_PRECISION: Record<string, number> = {
  XLM: 7,
  USDC: 2,
  NGNT: 2,
  EURC: 2,
}

const MIN_WITHDRAWAL: Record<string, string> = {
  XLM: '0.0000001',
  USDC: '1.00',
  NGNT: '100.00',
  EURC: '1.00',
}

const WITHDRAWAL_FEE: Record<string, string> = {
  XLM: '0.00001',
  USDC: '0.50',
  NGNT: '50.00',
  EURC: '0.50',
}

export default function ArtistWithdrawal() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedAsset, setSelectedAsset] = useState<'XLM' | 'USDC' | 'NGNT' | 'EURC'>('XLM')
  const [amount, setAmount] = useState('')
  const [selectedWalletId, setSelectedWalletId] = useState<string>('')
  const [showHistory, setShowHistory] = useState(false)

  const { data: wallets } = useQuery({
    queryKey: ['linkedWallets'],
    queryFn: async (): Promise<LinkedWallet[]> => (await http.get<{ wallets: LinkedWallet[] }>('/wallets')).wallets,
  })

  const { data: balances } = useQuery({
    queryKey: ['artistBalances', user?.id],
    queryFn: async (): Promise<Balance[]> => (await http.get<{ balances: Balance[] }>('/artist/balances')).balances,
  })

  const { data: history } = useQuery({
    queryKey: ['withdrawalHistory', user?.id],
    queryFn: async (): Promise<WithdrawalHistoryItem[]> => (await http.get<{ history: WithdrawalHistoryItem[] }>('/artist/withdrawals')).history,
  })

  const withdrawMutation = useMutation({
    mutationFn: async (payload: WithdrawalRequest) => http.post('/artist/withdraw', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistBalances', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['withdrawalHistory', user?.id] })
      setAmount('')
    },
  })

  const selectedBalance = balances?.find((b) => b.asset === selectedAsset)
  const availableAmount = selectedBalance?.available ?? '0'
  const precision = ASSET_PRECISION[selectedAsset] ?? 7
  const minAmount = MIN_WITHDRAWAL[selectedAsset] ?? '0.0000001'
  const fee = WITHDRAWAL_FEE[selectedAsset] ?? '0'
  const isAmountValid = parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(availableAmount)
  const hasValidWallet = wallets?.some((w) => w.id === selectedWalletId) ?? false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAmountValid || !hasValidWallet) return
    await withdrawMutation.mutateAsync({
      amount,
      asset: selectedAsset,
      walletId: selectedWalletId,
    })
  }

  const primaryWallet = wallets?.find((w) => w.isPrimary)
  const defaultWalletId = primaryWallet?.id ?? wallets?.[0]?.id ?? ''

  return (
    <div className="container flex flex-col gap-6 py-8">
      <div>
        <h1 className="text-h2">Withdraw Earnings</h1>
        <p className="mt-1 text-caption text-muted">
          Transfer available earnings to your linked Stellar wallet.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {balances?.map((balance) => (
          <div
            key={balance.asset}
            className={`rounded-card border border-line bg-surface p-6 shadow-card ${
              selectedAsset === balance.asset ? 'border-primary ring-1 ring-primary' : ''
            }`}
            onClick={() => setSelectedAsset(balance.asset as typeof selectedAsset)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedAsset(balance.asset as typeof selectedAsset) }}
          >
            <div className="flex items-center justify-between">
              <span className="text-caption-sm font-semibold text-foreground">{balance.asset}</span>
              <span className="rounded-control bg-surface-muted px-2 py-0.5 text-caption-sm text-muted">
                {balance.asset === 'XLM' ? 'Native' : 'Token'}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-caption-sm text-muted">Available</p>
              <p className="mt-1 text-h3 font-bold text-foreground font-mono">
                {parseFloat(balance.available).toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}
                <span className="text-caption font-normal text-muted ml-1">{balance.asset}</span>
              </p>
            </div>
            <div className="mt-2">
              <p className="text-caption-sm text-muted">Pending (escrow)</p>
              <p className="mt-1 text-caption font-mono text-muted">
                {parseFloat(balance.pending).toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}
                <span className="text-caption font-normal text-muted ml-1">{balance.asset}</span>
              </p>
              <p className="mt-1 text-caption-xs text-warning">Funds held in escrow cannot be withdrawn</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-line bg-surface p-6 shadow-card">
        <h2 className="text-h3">Withdraw {selectedAsset}</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 max-w-md">
          <div>
            <label htmlFor="wallet" className="block text-caption-sm font-medium text-foreground mb-1">
              Destination Wallet
            </label>
            <select
              id="wallet"
              value={selectedWalletId || defaultWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              disabled={withdrawMutation.isPending}
              className="w-full rounded-control border border-line bg-background px-3 py-2 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {wallets?.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.publicKey.slice(0, 10)}…{wallet.publicKey.slice(-8)} ({wallet.network}){wallet.isPrimary ? ' — Primary' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-caption-xs text-muted">Withdrawals only go to linked, verified wallets</p>
          </div>

          <div>
            <label htmlFor="amount" className="block text-caption-sm font-medium text-foreground mb-1">
              Amount ({selectedAsset})
            </label>
            <Input
              id="amount"
              type="number"
              step={Math.pow(10, -precision)}
              min={minAmount}
              max={availableAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max: ${parseFloat(availableAmount).toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}`}
              disabled={withdrawMutation.isPending}
              error={amount && (parseFloat(amount) > parseFloat(availableAmount) || parseFloat(amount) < parseFloat(minAmount))
                ? `Amount must be between ${minAmount} and ${availableAmount} ${selectedAsset}`
                : undefined}
            />
            <div className="mt-1 flex flex-wrap items-center gap-4 text-caption-sm text-muted">
              <span>Fee: {fee} {selectedAsset}</span>
              <span>Min: {minAmount} {selectedAsset}</span>
              <span>Available: {parseFloat(availableAmount).toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })} {selectedAsset}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={withdrawMutation.isPending}
            disabled={!isAmountValid || !hasValidWallet || withdrawMutation.isPending}
          >
            Withdraw {selectedAsset}
          </Button>

          {withdrawMutation.isError && (
            <p role="alert" className="text-caption text-danger">
              {withdrawMutation.error instanceof Error ? withdrawMutation.error.message : 'Withdrawal failed'}
            </p>
          )}
        </form>
      </div>

      <div className="rounded-card border border-line bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-h3">Withdrawal History</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Hide' : 'Show'} history
          </Button>
        </div>

        {showHistory && (
          <div className="mt-4">
            {history?.length === 0 ? (
              <p className="text-caption text-muted py-8 text-center">No withdrawals yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left" role="table">
                  <thead>
                    <tr className="border-b border-line bg-surface-muted">
                      <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Date</th>
                      <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Amount</th>
                      <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Asset</th>
                      <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Destination</th>
                      <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Status</th>
                      <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history?.map((item) => (
                      <tr key={item.id} className="border-b border-line/50 hover:bg-surface-muted/50">
                        <td className="px-4 py-3 text-caption-sm text-foreground">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-caption-sm font-mono text-foreground">
                          -{item.amount}
                        </td>
                        <td className="px-4 py-3 text-caption-sm text-foreground">{item.asset}</td>
                        <td className="px-4 py-3 text-caption-sm text-muted">
                          {item.destination.slice(0, 10)}…{item.destination.slice(-8)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption-sm font-medium ${
                              item.status === 'completed' ? 'bg-success/10 text-success' :
                              item.status === 'pending' ? 'bg-warning/10 text-warning' :
                              'bg-danger/10 text-danger'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-caption-sm">
                          {item.txHash ? (
                            <ExplorerLink value={item.txHash} type="tx" />
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}