import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, ExplorerLink, Spinner } from '@/components/ui'
import { http } from '@/services'
import { formatDate } from '@/lib'

type TxStatus = 'submitted' | 'confirming' | 'confirmed' | 'failed'

interface TransactionStatusData {
  txHash: string
  status: TxStatus
  artworkTitle?: string
  amount?: string
  asset?: string
  failureReason?: string
  confirmations?: number
  requiredConfirmations?: number
  submittedAt: string
  confirmedAt?: string
}

const STATUS_LABELS: Record<TxStatus, string> = {
  submitted: 'Submitted',
  confirming: 'Confirming',
  confirmed: 'Confirmed',
  failed: 'Failed',
}

const STATUS_COLORS: Record<TxStatus, string> = {
  submitted: 'bg-muted text-muted',
  confirming: 'bg-blue/10 text-blue',
  confirmed: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
}

interface TransactionStatusPollingProps {
  /** Transaction hash to poll */
  txHash: string
  /** Callback when status changes to confirmed */
  onConfirmed?: (data: TransactionStatusData) => void
  /** Callback when status changes to failed */
  onFailed?: (data: TransactionStatusData) => void
  /** Initial status (for immediate display) */
  initialStatus?: TransactionStatusData
  /** Polling interval in ms (default: exponential backoff starting at 3s) */
  pollInterval?: number
  /** Maximum time to poll in ms (default: 5 minutes) */
  maxPollTime?: number
  /** Show as inline component or full screen */
  inline?: boolean
}

export default function TransactionStatusPolling({
  txHash,
  onConfirmed,
  onFailed,
  initialStatus,
  pollInterval = 3000,
  maxPollTime = 5 * 60 * 1000,
  inline = false,
}: TransactionStatusPollingProps) {
  const [startTime] = useState(Date.now())
  const [currentStatus, setCurrentStatus] = useState<TxStatus>(initialStatus?.status ?? 'submitted')
  const [confirmations, setConfirmations] = useState(initialStatus?.confirmations ?? 0)
  const [requiredConfirmations, setRequiredConfirmations] = useState(initialStatus?.requiredConfirmations ?? 1)
  const [failureReason, setFailureReason] = useState<string | null>(null)

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['txStatus', txHash],
    queryFn: async (): Promise<TransactionStatusData> => {
      const response = await http.get<{ status: TransactionStatusData }>(`/transactions/${txHash}/status`)
      return response.status
    },
    enabled: !!txHash,
    refetchInterval: (data) => {
      if (!data) return pollInterval
      if (data.status === 'confirmed' || data.status === 'failed') return false
      // Exponential backoff: 3s, 6s, 12s, 24s, max 30s
      const elapsed = Date.now() - startTime
      const backoff = Math.min(pollInterval * Math.pow(2, Math.floor(elapsed / 15000)), 30000)
      return backoff
    },
  })

  // Update local state from query data
  useEffect(() => {
    if (data) {
      setCurrentStatus(data.status)
      setConfirmations(data.confirmations ?? 0)
      setRequiredConfirmations(data.requiredConfirmations ?? 1)
      if (data.failureReason) setFailureReason(data.failureReason)

      if (data.status === 'confirmed') {
        onConfirmed?.(data)
      } else if (data.status === 'failed') {
        setFailureReason(data.failureReason ?? 'Transaction failed')
        onFailed?.(data)
      }
    }
  }, [data, onConfirmed, onFailed])

  // Stop polling after max time
  useEffect(() => {
    const elapsed = Date.now() - startTime
    if (elapsed > maxPollTime && currentStatus === 'confirming') {
      // Show handoff screen
    }
  }, [currentStatus, startTime, maxPollTime])

  const isFinal = currentStatus === 'confirmed' || currentStatus === 'failed'
  const isSlow = Date.now() - startTime > 30000 && currentStatus === 'confirming'

  if (inline) {
    return (
      <div className={`rounded-card border border-line bg-surface p-4 shadow-card ${isFinal ? 'border-success/30' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${STATUS_COLORS[currentStatus]}`}
            >
              {currentStatus === 'confirming' && <Spinner className="h-5 w-5" />}
              {currentStatus === 'confirmed' && (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {currentStatus === 'failed' && (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              {currentStatus === 'submitted' && (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M21 12V7H5" />
                  <path d="M21 17H5" />
                  <path d="M7 7v10" />
                  <path d="M11 7v10" />
                  <path d="M15 7v10" />
                  <path d="M19 7v10" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-caption-sm font-medium text-foreground">{STATUS_LABELS[currentStatus]}</p>
              <p className="text-caption-xs text-muted font-mono">{txHash.slice(0, 12)}…{txHash.slice(-8)}</p>
            </div>
          </div>

          {currentStatus === 'confirming' && confirmations > 0 && (
            <div className="flex items-center gap-2 text-caption-sm text-muted">
              <span>Confirmations: {confirmations}/{requiredConfirmations}</span>
              <div className="h-2 w-32 bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min((confirmations / requiredConfirmations) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {currentStatus === 'confirmed' && data?.txHash && (
            <ExplorerLink value={data.txHash} type="tx" className="text-caption-sm" />
          )}
        </div>

        {isSlow && (
          <div className="mt-4 p-3 rounded-control bg-warning/10 border border-warning/30">
            <p className="text-caption-sm text-warning">
              <strong>Still processing…</strong> The Stellar network is taking longer than usual.
              Your transaction is submitted and will confirm shortly. You can safely close this window
              and check back later.
            </p>
          </div>
        )}

        {currentStatus === 'failed' && (
          <div className="mt-4 p-3 rounded-control bg-danger/10 border border-danger/30">
            <p className="text-caption-sm text-danger">
              <strong>Transaction failed:</strong> {failureReason ?? 'Unknown error'}
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => void refetch()}>
                Check Again
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href="/support">Contact Support</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Full screen version
  if (isPending && !initialStatus) {
    return (
      <div className="container py-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-10 w-10" />
          <p className="text-caption text-muted">Loading transaction status…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 max-w-md mx-auto">
      <div className="rounded-card border border-line bg-surface p-8 shadow-card text-center">
        <div className="mb-6">
          <div
            className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center ${STATUS_COLORS[currentStatus]}`}
          >
            {currentStatus === 'confirming' && <Spinner className="h-10 w-10" />}
            {currentStatus === 'confirmed' && (
              <svg className="h-10 w-10 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {currentStatus === 'failed' && (
              <svg className="h-10 w-10 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            {currentStatus === 'submitted' && (
              <svg className="h-10 w-10 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M21 12V7H5" />
                <path d="M21 17H5" />
                <path d="M7 7v10" />
                <path d="M11 7v10" />
                <path d="M15 7v10" />
                <path d="M19 7v10" />
              </svg>
            )}
          </div>
        </div>

        <h1 className="text-h2">{STATUS_LABELS[currentStatus]}</h1>
        <p className="mt-2 text-caption text-muted">
          Transaction: <code className="font-mono">{txHash.slice(0, 16)}…{txHash.slice(-8)}</code>
        </p>

        {currentStatus === 'confirming' && (
          <div className="mt-6 space-y-4">
            <div className="text-caption-sm text-muted">
              Confirmations: <strong>{confirmations}/{requiredConfirmations}</strong>
            </div>
            <div className="h-3 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min((confirmations / requiredConfirmations) * 100, 100)}%` }}
              />
            </div>
            <p className="text-caption-xs text-muted">
              Submitted {formatDate(initialStatus?.submittedAt ?? new Date().toISOString())}
            </p>

            {isSlow && (
              <div className="mt-4 p-4 rounded-control bg-warning/10 border border-warning/30">
                <p className="text-caption-sm text-warning">
                  <strong>Still processing…</strong> The Stellar network is taking longer than usual.
                  Your transaction is submitted and will confirm shortly. You can safely close this window
                  and check back later.
                </p>
              </div>
            )}
          </div>
        )}

        {currentStatus === 'confirmed' && (
          <div className="mt-6 space-y-4">
            <p className="text-caption text-muted">
              Confirmed at {data?.confirmedAt ? formatDate(data.confirmedAt) : 'just now'}
            </p>
            {data?.txHash && (
              <ExplorerLink value={data.txHash} type="tx" />
            )}
          </div>
        )}

        {currentStatus === 'failed' && (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-control bg-danger/10 border border-danger/30">
              <p className="text-caption-sm text-danger">
                <strong>Transaction failed:</strong> {failureReason ?? 'Unknown error'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button size="sm" variant="secondary" onClick={() => void refetch()}>
                Check Again
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href="/support">Contact Support</a>
              </Button>
            </div>
          </div>
        )}

        {!isFinal && (
          <p className="mt-6 text-caption-xs text-muted">
            This page updates automatically. Do not close until confirmed.
          </p>
        )}
      </div>
    </div>
  )
}