import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, ExplorerLink, Spinner } from '@/components/ui'
import { http } from '@/services'
import { formatDate } from '@/lib'

interface PaymentResultData {
  id: string
  status: 'success' | 'failed'
  artworkTitle: string
  artworkThumbnail?: string
  sellerName: string
  amount: string
  asset: string
  platformFee: string
  networkFee: string
  total: string
  txHash: string | null
  failureReason?: string
  failureCategory?: 'rejected' | 'insufficient_funds' | 'network' | 'timeout' | 'unknown'
  deliverables?: Deliverable[]
  createdAt: string
  checkoutSessionId: string
}

interface Deliverable {
  id: string
  name: string
  url: string
  expiresAt: string
}

const FAILURE_REMEDIES: Record<string, { title: string; description: string; actionLabel: string; action: () => void }> = {
  rejected: {
    title: 'Transaction Rejected',
    description: 'You cancelled the transaction in your wallet. No funds were transferred.',
    actionLabel: 'Try Again',
    action: () => {},
  },
  insufficient_funds: {
    title: 'Insufficient Funds',
    description: 'Your wallet does not have enough balance to cover the payment and fees.',
    actionLabel: 'Add Funds',
    action: () => {},
  },
  network: {
    title: 'Network Error',
    description: 'The Stellar network is experiencing issues. Please try again in a few minutes.',
    actionLabel: 'Retry',
    action: () => {},
  },
  timeout: {
    title: 'Transaction Timeout',
    description: 'The transaction took too long to confirm. It may still be processing.',
    actionLabel: 'Check Status',
    action: () => {},
  },
  unknown: {
    title: 'Payment Failed',
    description: 'An unexpected error occurred. Please try again or contact support.',
    actionLabel: 'Retry',
    action: () => {},
  },
}

export default function PaymentResultScreen() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const [showConfetti, setShowConfetti] = useState(false)

  const { data: result, isPending, isError, error, refetch } = useQuery({
    queryKey: ['paymentResult', sessionId],
    queryFn: async (): Promise<PaymentResultData> => {
      if (!sessionId) throw new Error('No session ID')
      const response = await http.get<{ result: PaymentResultData }>(`/payments/result/${sessionId}`)
      return response.result
    },
    enabled: !!sessionId,
    refetchInterval: (data) => data?.status === 'success' ? false : 5000,
  })

  useEffect(() => {
    if (result?.status === 'success' && !showConfetti) {
      setShowConfetti(true)
    }
  }, [result?.status, showConfetti])

  if (!sessionId) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-h2">Invalid payment link</h1>
        <p className="mt-2 text-caption text-muted">Missing session ID.</p>
        <Button className="mt-6" asChild>
          <a href="/">Go home</a>
        </Button>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="container py-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-10 w-10" />
          <p className="text-caption text-muted">Loading payment result…</p>
        </div>
      </div>
    )
  }

  if (isError || !result) {
    return (
      <div className="container py-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-16 w-16 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h1 className="text-h2">Failed to load result</h1>
          <p className="text-caption text-muted">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button className="mt-4" onClick={() => void refetch()}>Try again</Button>
        </div>
      </div>
    )
  }

  const isSuccess = result.status === 'success'
  const remedy = result.failureCategory ? FAILURE_REMEDIES[result.failureCategory] : FAILURE_REMEDIES.unknown

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        {showConfetti && isSuccess && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
            <Confetti />
          </div>
        )}

        <div className={`rounded-card border border-line bg-surface p-8 shadow-card text-center ${isSuccess ? '' : 'border-danger/30'}`}>
          {isSuccess ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-h2">Payment Successful!</h1>
              <p className="mt-2 text-caption text-muted">
                Your purchase of <strong>{result.artworkTitle}</strong> has been confirmed on-chain.
              </p>

              <div className="mt-6 rounded-card bg-surface-muted p-4 text-left">
                <h3 className="text-caption-sm font-semibold text-foreground">Order Summary</h3>
                <div className="mt-3 space-y-2 text-caption-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Artwork</span>
                    <span>{result.artworkTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Seller</span>
                    <span>{result.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Amount</span>
                    <span className="font-mono">{result.amount} {result.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Platform fee</span>
                    <span className="font-mono">{result.platformFee} {result.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Network fee</span>
                    <span className="font-mono">{result.networkFee} {result.asset}</span>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold font-mono">{result.total} {result.asset}</span>
                  </div>
                </div>
              </div>

              {result.txHash && (
                <div className="mt-4 p-3 rounded-control bg-surface-muted">
                  <p className="text-caption-xs text-muted">Transaction Hash</p>
                  <ExplorerLink value={result.txHash} type="tx" />
                </div>
              )}

              {result.deliverables && result.deliverables.length > 0 && (
                <div className="mt-6 rounded-card border border-line bg-surface p-4 shadow-card text-left">
                  <h3 className="text-caption-sm font-semibold text-foreground">Your Deliverables</h3>
                  <p className="mt-1 text-caption text-muted">Download links expire on {formatDate(result.deliverables[0].expiresAt)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.deliverables.map((d) => (
                      <Button key={d.id} size="sm" variant="secondary" asChild>
                        <a href={d.url} target="_blank" rel="noreferrer">
                          Download {d.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <a href={`/artists/${result.sellerName.toLowerCase().replace(/\s+/g, '_')}`}>View Seller Profile</a>
                </Button>
                <Button variant="secondary" asChild>
                  <a href="/orders/purchases">View All Purchases</a>
                </Button>
              </div>

              <p className="mt-4 text-caption-xs text-muted">
                A receipt has been sent to your email.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-danger/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              </div>
              <h1 className="text-h2">{remedy.title}</h1>
              <p className="mt-2 text-caption text-muted">
                Your purchase of <strong>{result.artworkTitle}</strong> could not be completed.
              </p>

              <div className="mt-4 rounded-control bg-danger/10 p-4 text-left">
                <p className="text-caption-sm font-semibold text-danger">{remedy.description}</p>
                {result.failureReason && (
                  <p className="mt-1 text-caption text-foreground">{result.failureReason}</p>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => window.history.back()}>{remedy.actionLabel}</Button>
                <Button variant="secondary" asChild>
                  <a href="/">Go Home</a>
                </Button>
              </div>

              <p className="mt-4 text-caption-xs text-muted">
                You were not charged. The checkout session is preserved for retry.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Need to import useQuery
import { useQuery } from '@tanstack/react-query'

function Confetti() {
  const [particles] = useState(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 50,
      size: 6 + Math.random() * 8,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)],
      speed: 1 + Math.random() * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }))
  )

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `fall ${3 + Math.random() * 2}s linear forwards`,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes fall {
          to {
            transform: translateY(120vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}