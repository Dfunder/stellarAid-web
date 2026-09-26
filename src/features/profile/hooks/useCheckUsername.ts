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
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const clean = username.trim().toLowerCase().replace(/^@/, '')
    const cleanCurrent = currentUsername?.trim().toLowerCase().replace(/^@/, '')

    if (!clean) {
      setIsChecking(false)
      setIsAvailable(null)
      setMessage(null)
      return
    }

    if (cleanCurrent && clean === cleanCurrent) {
      setIsChecking(false)
      setIsAvailable(true)
      setMessage('This is your current username.')
      return
    }

    setIsChecking(true)
    setMessage(null)

    const timer = setTimeout(async () => {
      try {
        const res = await profileService.checkUsernameAvailability(clean, currentUserId)
        setIsAvailable(res.available)
        setMessage(res.message || (res.available ? 'Username is available!' : 'Username is already taken.'))
      } catch {
        setIsAvailable(true)
        setMessage(null)
      } finally {
        setIsChecking(false)
      }
    }, delayMs)

    return () => clearTimeout(timer)
  }, [username, currentUsername, currentUserId, delayMs])

  return { isChecking, isAvailable, message }
}
