import type { User } from '@/types'

export interface AuthSession {
  accessToken: string
  refreshToken: string | null
  user: User
}
