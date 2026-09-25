export interface AuthUser {
  id: string
  email: string
  displayName?: string
  emailVerified: boolean
}

export interface AuthSession {
  accessToken: string
  refreshToken: string | null
  user: AuthUser
}

export interface LoginCredentials {
  email: string
  password: string
}
