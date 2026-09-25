/**
 * API clients and external service integrations.
 *
 * Feature-specific API calls live in `src/features/<feature>/services`.
 */
export {
  ApiError,
  getApiErrorMessage,
  getErrorMessage,
  http,
  isApiError,
  setAuthTokenProvider,
  setTokenRefresher,
  setUnauthorizedHandler,
} from './http'
export type { AuthTokenProvider, Http, TokenRefresher, UnauthorizedHandler } from './http'
