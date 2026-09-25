import { http } from '@/services'
import {
  mapUser,
  type AuthSessionDto,
  type AuthTokensDto,
  type LoginRequestDto,
  type RegisterRequestDto,
  type User,
  type UserDto,
} from '@/types'
import type { AuthSession } from '../types'

export const authService = {
  login: async (credentials: LoginRequestDto): Promise<AuthSession> => {
    const dto = await http.post<AuthSessionDto>('/auth/login', credentials)
    return {
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken ?? null,
      user: mapUser(dto.user),
    }
  },

  register: async (request: RegisterRequestDto): Promise<void> => {
    await http.post<{ user?: UserDto }>('/auth/register', request, { skipRetry: true })
  },

  /** Exchanges a refresh token for new tokens; bypasses the 401 refresh interceptor. */
  refresh: async (
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string | null }> => {
    const dto = await http.post<AuthTokensDto>(
      '/auth/refresh',
      { refreshToken },
      { skipAuthRefresh: true, skipRetry: true },
    )
    return { accessToken: dto.accessToken, refreshToken: dto.refreshToken ?? null }
  },

  verifyEmail: async (token: string): Promise<User | null> => {
    const dto = await http.post<{ user?: UserDto }>(
      '/auth/verify-email',
      { token },
      { skipRetry: true },
    )
    return dto.user ? mapUser(dto.user) : null
  },

  resendVerification: async (email: string): Promise<void> => {
    await http.post<void>('/auth/resend-verification', { email }, { skipRetry: true })
  },
}
