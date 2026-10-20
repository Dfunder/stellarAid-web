import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { useStellarBalance, validateStakeBalance, requireBalance } from '@/hooks/useStellarBalance'

export interface StakeFormProps {
  /** User's available token balance for staking. Overrides hook balance if provided. */
  availableBalance?: string | number
  /** Asset identifier (e.g., 'XLM', 'AID'). Defaults to 'XLM'. */
  asset?: string
  /** Display unit for balance and error messages (defaults to 'tokens'). */
  unit?: string
  /** Async callback invoked when staking transaction is submitted and validated. */
  onStake?: (amount: string) => Promise<void>
  /** Callback fired upon successful stake execution. */
  onSuccess?: () => void
  /** Callback fired upon failure or validation error. */
  onError?: (error: string) => void
  /** Additional CSS class names */
  className?: string
}

/**
 * Staking form with strict pre-transaction balance validation (#941).
 * Prevents users from staking more tokens than their available balance.
 */
export default function StakeForm({
  availableBalance: propBalance,
  asset = 'XLM',
  unit = 'tokens',
  onStake,
  onSuccess,
  onError,
  className = '',
}: StakeFormProps) {
  const { balance: hookBalance } = useStellarBalance({
    asset,
    initialBalance: propBalance,
  })

  const effectiveBalance = propBalance !== undefined ? String(propBalance) : hookBalance
  const [amount, setAmount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const handleMaxClick = () => {
    setAmount(effectiveBalance)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSuccess(false)

    // 1. Validate balance before transaction (#941)
    const validation = validateStakeBalance(amount, effectiveBalance, {
      action: 'stake',
      unit,
    })

    if (!validation.isValid) {
      const errorMsg = validation.error ?? 'Insufficient balance.'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // 2. Double-check guard constraint
    try {
      requireBalance(effectiveBalance, amount, { action: 'stake', unit })
    } catch (guardErr) {
      const guardMsg = guardErr instanceof Error ? guardErr.message : 'Insufficient balance'
      setError(guardMsg)
      onError?.(guardMsg)
      return
    }

    // 3. Initiate stake transaction
    setError(null)
    setIsSubmitting(true)

    try {
      if (onStake) {
        await onStake(amount)
      }
      setIsSuccess(true)
      onSuccess?.()
    } catch (err) {
      const failureMsg = err instanceof Error ? err.message : 'Staking transaction failed'
      setError(failureMsg)
      onError?.(failureMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between text-caption text-muted">
        <span>Available balance:</span>
        <div className="flex items-center gap-2">
          <strong className="font-mono text-foreground" data-testid="available-balance">
            {effectiveBalance} {unit}
          </strong>
          <button
            type="button"
            onClick={handleMaxClick}
            className="text-primary text-caption-sm font-semibold hover:underline"
            data-testid="stake-max-btn"
          >
            Max
          </button>
        </div>
      </div>

      <Input
        label="Stake amount"
        name="amount"
        type="number"
        step="any"
        min="0"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.0"
        value={amount}
        error={error}
        hint={`Enter up to ${effectiveBalance} ${unit}`}
        onChange={(e) => {
          setAmount(e.target.value)
          if (error) setError(null)
        }}
        data-testid="stake-amount-input"
      />

      {isSuccess ? (
        <p role="status" className="text-caption text-success" data-testid="stake-success-msg">
          Successfully staked {amount} {unit}!
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full justify-center"
        data-testid="stake-submit-btn"
      >
        {isSubmitting ? 'Staking...' : 'Stake Tokens'}
      </Button>
    </form>
  )
}
