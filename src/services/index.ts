/**
 * API clients and external service integrations.
 *
 * Feature-specific API calls live in `src/features/<feature>/services`.
 */
export {
  ApiError,
  getErrorMessage,
  http,
  isApiError,
  setAuthTokenProvider,
  setUnauthorizedHandler,
} from './http'
export type { AuthTokenProvider, Http, UnauthorizedHandler } from './http'
