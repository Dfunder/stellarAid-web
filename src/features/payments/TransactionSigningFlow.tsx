import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Modal, Spinner } from '@/components/ui'
import { http } from '@/services'
import { useWallet } from '@/features/auth/hooks/useWallet'
import { signWithConnectedWallet } from '@/features/auth/services/wallets'
import { getWalletConnection } from '@/features/auth/stores/walletStore'

interface TransactionSigningFlowProps {
  /** Checkout session ID */
  sessionId: string
  /** Callback when signing completes successfully */
  onSuccess?: (txHash: string) => void
  /** Callback when user rejects signing */
  onReject?: () => void
  /** Callback when signing fails */
  onError?: (error: Error) => void
}

type SigningStep = 'preparing' | 'waiting_for_wallet' | 'signing' | 'submitting' | 'completed' | 'failed'

export default function TransactionSigningFlow({
  sessionId,
  onSuccess,
  onReject,
  onError,
}: TransactionSigningFlowProps) {
  const { publicKey, isConnected } = useWallet()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<SigningStep>('preparing')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [signedXdr, setSignedXdr] = useState<string | null>(null)

  const prepareMutation = useMutation({
    mutationFn: async (): Promise<{ xdr: string; txHash: string }> => {
      const response = await http.post<{ xdr: string; txHash: string }>(`/payments/${sessionId}/prepare`)
      return response
    },
    onSuccess: (data) => {
      setSignedXdr(data.xdr)
      setTxHash(data.txHash)
      setStep('waiting_for_wallet')
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to prepare transaction')
      setStep('failed')
    },
  })

  const submitMutation = useMutation({
    mutationFn: async (signedXdr: string): Promise<{ txHash: string }> => {
      const response = await http.post<{ txHash: string }>(`/payments/${sessionId}/submit`, { signedXdr })
      return response
    },
    onSuccess: (data) => {
      setTxHash(data.txHash)
      setStep('completed')
      queryClient.invalidateQueries({ queryKey: ['paymentResult', sessionId] })
      onSuccess?.(data.txHash)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to submit transaction')
      setStep('failed')
    },
  })

  const handleSign = useCallback(async () => {
    if (!signedXdr) return

    setStep('signing')
    setError(null)

    try {
      const connection = getWalletConnection()
      if (!connection) {
        throw new Error('Wallet disconnected')
      }

      const signed = await signWithConnectedWallet(signedXdr)
      setStep('submitting')
      await submitMutation.mutateAsync(signed)
    } catch (err) {
      if (err instanceof Error && err.message.includes('rejected')) {
        setStep('failed')
        setError('Transaction rejected in wallet')
        onReject?.()
      } else {
        setStep('failed')
        const errorMsg = err instanceof Error ? err.message : 'Signing failed'
        setError(errorMsg)
        onError?.(new Error(errorMsg))
      }
    }
  }, [signedXdr, submitMutation, onReject, onError])

  // Auto-prepare on mount
  useState(() => {
    prepareMutation.mutate()
  })

  if (!isConnected) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 shadow-card text-center">
        <svg className="h-16 w-16 mx-auto text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
        <h2 className="mt-4 text-h3">Connect Your Wallet</h2>
        <p className="mt-2 text-caption text-muted">You need to connect a Stellar wallet to sign this transaction.</p>
      </div>
    )
  }

  const stepLabels: Record<SigningStep, string> = {
    preparing: 'Preparing transaction…',
    waiting_for_wallet: 'Ready to sign',
    signing: 'Opening wallet…',
    submitting: 'Submitting to network…',
    completed: 'Transaction submitted!',
    failed: 'Signing failed',
  }

  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-card">
      <div className="mb-6">
        <div className="h-2 bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${['preparing', 'waiting_for_wallet', 'signing', 'submitting', 'completed'].indexOf(step) + 1} * 20%`,
            }}
          />
        </div>
        <p className="mt-2 text-caption text-muted text-center">{stepLabels[step]}</p>
      </div>

      {step === 'preparing' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner className="h-10 w-10" />
          <p className="text-caption text-muted">Building transaction…</p>
        </div>
      )}

      {step === 'waiting_for_wallet' && (
        <div className="space-y-4">
          <div className="rounded-control bg-surface-muted p-4 text-left">
            <p className="text-caption-sm font-medium text-foreground mb-2">Transaction Details</p>
            <dl className="space-y-1 text-caption-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Status</dt>
                <dd className="font-mono">Ready to sign</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">TX Hash (predicted)</dt>
                <dd className="font-mono text-caption-xs">{txHash?.slice(0, 16)}…{txHash?.slice(-8)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">From</dt>
                <dd className="font-mono text-caption-xs">{publicKey?.slice(0, 10)}…{publicKey?.slice(-8)}</dd>
              </div>
            </dl>
          </div>

          <div className="p-3 rounded-control bg-primary/10 border border-primary/30 text-caption-sm text-primary">
            <svg className="inline h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Review the transaction in your wallet before approving. The amount and recipient
            must match the checkout summary.
          </div>

          <Button className="w-full" size="lg" onClick={handleSign} isLoading={submitMutation.isPending}>
            Open Wallet & Sign
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => { setStep('failed'); onReject?.() }}>
            Cancel
          </Button>
        </div>
      )}

      {step === 'signing' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner className="h-10 w-10" />
          <p className="text-caption text-muted">Waiting for wallet signature…</p>
          <p className="text-caption-xs text-muted">Please approve the transaction in your wallet popup.</p>
        </div>
      )}

      {step === 'submitting' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner className="h-10 w-10" />
          <p className="text-caption text-muted">Broadcasting to Stellar network…</p>
        </div>
      )}

      {step === 'completed' && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-h3">Transaction Submitted!</h3>
          <p className="text-caption text-muted">Your payment is being processed on the Stellar network.</p>
          {txHash && (
            <div className="mt-4 p-3 rounded-control bg-surface-muted">
              <p className="text-caption-xs text-muted">Transaction Hash</p>
              <code className="font-mono text-caption-sm break-all">{txHash}</code>
            </div>
          )}
        </div>
      )}

      {step === 'failed' && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="h-16 w-16 rounded-full bg-danger/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="text-h3">Signing Failed</h3>
          <p className="text-caption text-danger">{error ?? 'Unknown error'}</p>
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
            <Button className="flex-1" onClick={() => { setStep('waiting_for_wallet'); setError(null); }}>
              Try Again
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onReject}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={step === 'waiting_for_wallet' && !isConnected}
        onClose={() => {}}
        title="Wallet Disconnected"
        description="Your wallet was disconnected. Please reconnect to continue."
      >
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { setStep('failed'); onReject?.() }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => { /* reconnect logic */ }}>
            Reconnect Wallet
          </Button>
        </div>
      </Modal>
    </div>
  )
}