import { useEffect, useState } from 'react'
import { profileService } from '../services/profileService'

export interface UseCheckUsernameResult {
  isChecking: boolean
  isAvailable: boolean | null
  message: string | null
}

export function useCheckUsername(
  username: string,
  currentUsername?: string,
  currentUserId?: string,
  delayMs = 400,
): UseCheckUsernameResult {
  const clean = username.trim().toLowerCase().replace(/^@/, '')
  const cleanCurrent = currentUsername?.trim().toLowerCase().replace(/^@/, '')
  const isCurrentUsername = Boolean(cleanCurrent && clean === cleanCurrent)

  const [availability, setAvailability] = useState<{ for: string; available: boolean; message: string | null } | null>(null)

  useEffect(() => {
    if (!clean || isCurrentUsername) return
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await profileService.checkUsernameAvailability(clean, currentUserId)
        if (cancelled) return
        setAvailability({
          for: clean,
          available: res.available,
          message: res.message || (res.available ? 'Username is available!' : 'Username is already taken.'),
        })
      } catch {
        if (!cancelled) setAvailability({ for: clean, available: true, message: null })
      }
    }, delayMs)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [clean, isCurrentUsername, currentUserId, delayMs])

  const awaitingCheck = Boolean(clean && !isCurrentUsername && availability?.for !== clean)

  const isChecking = awaitingCheck
  const isAvailable = isCurrentUsername ? true : awaitingCheck ? null : (availability?.available ?? null)
  const message = isCurrentUsername
    ? 'This is your current username.'
    : awaitingCheck
      ? null
      : (availability?.message ?? null)

  return { isChecking, isAvailable, message }
}