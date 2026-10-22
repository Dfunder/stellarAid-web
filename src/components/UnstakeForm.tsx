import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { useStellarBalance, validateStakeBalance, requireBalance } from '@/hooks/useStellarBalance'

export interface UnstakeFormProps {
  /** User's current staked balance eligible for unstaking. */
  stakedBalance?: string | number
  /** Asset identifier (e.g., 'XLM', 'AID'). Defaults to 'XLM'. */
  asset?: string
  /** Display unit for balance and error messages (defaults to 'tokens'). */
  unit?: string
  /** Async callback invoked when unstaking transaction is submitted and validated. */
  onUnstake?: (amount: string) => Promise<void>
  /** Callback fired upon successful unstake execution. */
  onSuccess?: () => void
  /** Callback fired upon failure or validation error. */
  onError?: (error: string) => void
  /** Additional CSS class names */
  className?: string
}

/**
 * Unstaking form with strict pre-transaction balance validation (#941).
 * Prevents users from unstaking more tokens than their active staked balance.
 */
export default function UnstakeForm({
  stakedBalance: propStakedBalance,
  asset = 'XLM',
  unit = 'tokens',
  onUnstake,
  onSuccess,
  onError,
  className = '',
}: UnstakeFormProps) {
  const { stakedBalance: hookStakedBalance } = useStellarBalance({
    asset,
    initialStakedBalance: propStakedBalance,
  })

  const effectiveStakedBalance =
    propStakedBalance !== undefined ? String(propStakedBalance) : hookStakedBalance

  const [amount, setAmount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const handleMaxClick = () => {
    setAmount(effectiveStakedBalance)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSuccess(false)

    // 1. Validate balance before transaction (#941)
    const validation = validateStakeBalance(amount, effectiveStakedBalance, {
      action: 'unstake',
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
      requireBalance(effectiveStakedBalance, amount, { action: 'unstake', unit })
    } catch (guardErr) {
      const guardMsg = guardErr instanceof Error ? guardErr.message : 'Insufficient balance'
      setError(guardMsg)
      onError?.(guardMsg)
      return
    }

    // 3. Initiate unstake transaction
    setError(null)
    setIsSubmitting(true)

    try {
      if (onUnstake) {
        await onUnstake(amount)
      }
      setIsSuccess(true)
      onSuccess?.()
    } catch (err) {
      const failureMsg = err instanceof Error ? err.message : 'Unstaking transaction failed'
      setError(failureMsg)
      onError?.(failureMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between text-caption text-muted">
        <span>Staked balance:</span>
        <div className="flex items-center gap-2">
          <strong className="font-mono text-foreground" data-testid="staked-balance">
            {effectiveStakedBalance} {unit}
          </strong>
          <button
            type="button"
            onClick={handleMaxClick}
            className="text-primary text-caption-sm font-semibold hover:underline"
            data-testid="unstake-max-btn"
          >
            Max
          </button>
        </div>
      </div>

      <Input
        label="Unstake amount"
        name="amount"
        type="number"
        step="any"
        min="0"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.0"
        value={amount}
        error={error}
        hint={`Enter up to ${effectiveStakedBalance} ${unit}`}
        onChange={(e) => {
          setAmount(e.target.value)
          if (error) setError(null)
        }}
        data-testid="unstake-amount-input"
      />

      {isSuccess ? (
        <p role="status" className="text-caption text-success" data-testid="unstake-success-msg">
          Successfully unstaked {amount} {unit}!
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        variant="secondary"
        className="w-full justify-center"
        data-testid="unstake-submit-btn"
      >
        {isSubmitting ? 'Unstaking...' : 'Unstake Tokens'}
      </Button>
    </form>
  )
}
