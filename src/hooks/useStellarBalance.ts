import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@/features/auth/hooks/useWallet'
import { http } from '@/services'
import type { AssetBalance } from '@/features/payments/walletBalances'

export type StakingAction = 'stake' | 'unstake' | 'delegate' | 'compound'

export interface ValidateBalanceOptions {
  action?: StakingAction
  unit?: string
}

export interface ValidationResult {
  isValid: boolean
  error: string | null
}

/**
 * Validates that the requested amount is a positive number and does not exceed the available balance.
 * Returns a descriptive error message matching:
 * "Insufficient balance. You have X tokens, trying to stake Y."
 */
export function validateStakeBalance(
  amount: string | number,
  availableBalance: string | number,
  options?: ValidateBalanceOptions,
): ValidationResult {
  const action = options?.action ?? 'stake'
  const unit = options?.unit ?? 'tokens'

  const rawAmountStr = typeof amount === 'number' ? String(amount) : amount.trim()
  if (!rawAmountStr) {
    return { isValid: false, error: 'Enter a valid amount greater than zero.' }
  }

  const numAmount = parseFloat(rawAmountStr)
  if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Enter a valid amount greater than zero.' }
  }

  const numBalance =
    typeof availableBalance === 'number'
      ? availableBalance
      : parseFloat(String(availableBalance).trim())
  const validBalance = isNaN(numBalance) || !isFinite(numBalance) ? 0 : numBalance

  if (numAmount > validBalance) {
    return {
      isValid: false,
      error: `Insufficient balance. You have ${availableBalance} ${unit}, trying to ${action} ${amount}.`,
    }
  }

  return { isValid: true, error: null }
}

/**
 * Contract-level balance guard. Throws an error if user balance is insufficient (#941).
 * Mirrors: require(userBalance >= amount, "Insufficient balance...")
 */
export function requireBalance(
  availableBalance: string | number,
  amount: string | number,
  options?: ValidateBalanceOptions,
): void {
  const result = validateStakeBalance(amount, availableBalance, options)
  if (!result.isValid) {
    throw new Error(result.error ?? 'Insufficient balance')
  }
}

export interface UseStellarBalanceOptions {
  asset?: string
  initialBalance?: string | number
  initialStakedBalance?: string | number
  initialRewardsBalance?: string | number
  publicKey?: string | null
}

export interface UseStellarBalanceResult {
  balance: string
  stakedBalance: string
  rewardsBalance: string
  isLoading: boolean
  isError: boolean
  error: string | null
  refetch: () => Promise<void>
  getBalance: (assetCode?: string) => Promise<string>
  getStakedBalance: () => Promise<string>
}

/**
 * Hook to retrieve real-time Stellar balances for staking workflows (#941).
 */
export function useStellarBalance(options: UseStellarBalanceOptions = {}): UseStellarBalanceResult {
  const {
    asset = 'XLM',
    initialBalance = '100',
    initialStakedBalance = '50',
    initialRewardsBalance = '10',
    publicKey: overridePublicKey,
  } = options

  const { publicKey: walletPublicKey } = useWallet()
  const activePublicKey = overridePublicKey ?? walletPublicKey

  const [balance, setBalance] = useState<string>(String(initialBalance))
  const [stakedBalance, setStakedBalance] = useState<string>(String(initialStakedBalance))
  const [rewardsBalance, setRewardsBalance] = useState<string>(String(initialRewardsBalance))
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activePublicKey) return

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setIsError(false)
      setError(null)

      try {
        const response = await http.get<{
          balances?: AssetBalance[]
          staked?: Record<string, string>
          rewards?: Record<string, string>
        }>(`/wallets/${encodeURIComponent(activePublicKey)}/balances`, { skipToast: true })

        if (cancelled) return

        if (response.balances) {
          const found = response.balances.find((b) => b.asset === asset)
          if (found) {
            setBalance(found.balance)
          }
        }

        if (response.staked?.[asset]) {
          setStakedBalance(response.staked[asset])
        }
        if (response.rewards?.[asset]) {
          setRewardsBalance(response.rewards[asset])
        }
      } catch (err) {
        if (!cancelled) {
          setIsError(true)
          setError(err instanceof Error ? err.message : 'Failed to fetch balance')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [activePublicKey, asset])

  const refetch = useCallback(async () => {
    if (!activePublicKey) return

    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const response = await http.get<{
        balances?: AssetBalance[]
        staked?: Record<string, string>
        rewards?: Record<string, string>
      }>(`/wallets/${encodeURIComponent(activePublicKey)}/balances`, { skipToast: true })

      if (response.balances) {
        const found = response.balances.find((b) => b.asset === asset)
        if (found) {
          setBalance(found.balance)
        }
      }

      if (response.staked?.[asset]) {
        setStakedBalance(response.staked[asset])
      }
      if (response.rewards?.[asset]) {
        setRewardsBalance(response.rewards[asset])
      }
    } catch (err) {
      setIsError(true)
      setError(err instanceof Error ? err.message : 'Failed to fetch balance')
    } finally {
      setIsLoading(false)
    }
  }, [activePublicKey, asset])

  const getBalance = useCallback(
    async (assetCode?: string): Promise<string> => {
      if (!activePublicKey) {
        return balance
      }
      try {
        const response = await http.get<{ balances?: AssetBalance[] }>(
          `/wallets/${encodeURIComponent(activePublicKey)}/balances`,
          { skipToast: true },
        )
        const targetAsset = assetCode ?? asset
        const found = response.balances?.find((b) => b.asset === targetAsset)
        return found ? found.balance : balance
      } catch {
        return balance
      }
    },
    [activePublicKey, asset, balance],
  )

  const getStakedBalance = useCallback(async (): Promise<string> => {
    return stakedBalance
  }, [stakedBalance])

  return {
    balance,
    stakedBalance,
    rewardsBalance,
    isLoading,
    isError,
    error,
    refetch,
    getBalance,
    getStakedBalance,
  }
}
