/**
 * The app's route table as data (#790/#803).
 *
 * `App.tsx` renders these routes as JSX; keeping a machine-readable copy here
 * lets tests assert on paths and guards without rendering the app.
 * `routeTable.test.ts` fails if this table and the router ever drift apart
 * (see that file for the exact guarantees).
 */
export type RouteGuard = 'public' | 'guest' | 'auth' | 'artist'

export interface RouteDescriptor {
  /** React Router pattern, exactly as declared in `App.tsx`. */
  path: string
  /** Which route guard must wrap the page: `GuestRoute`, `RequireAuth`, `ArtistRoute`, or none. */
  guard: RouteGuard
}

export const ROUTE_TABLE: RouteDescriptor[] = [
  // Guest (signed-out only) — inside <GuestRoute>.
  { path: 'login', guard: 'guest' },
  { path: 'register', guard: 'guest' },
  { path: 'forgot-password', guard: 'guest' },
  { path: 'reset-password', guard: 'guest' },

  // Public — inside <AuthLayout> with no guard.
  { path: 'verify-email', guard: 'public' },
  { path: 'artists/:username', guard: 'public' },
  { path: 'category/:slug', guard: 'public' },

  // Authenticated — wrapped in <RequireAuth>.
  { path: 'profile/edit', guard: 'auth' },
  { path: 'dashboard', guard: 'auth' },
  { path: 'transactions', guard: 'auth' },
  { path: 'earnings/withdraw', guard: 'auth' },
  { path: 'purchases', guard: 'auth' },
  { path: 'order/confirmation', guard: 'auth' },
  { path: 'checkout/:artworkId', guard: 'auth' },
  { path: 'artist/listings', guard: 'auth' },
  { path: 'artist/listings/:listingId/edit', guard: 'auth' },
  { path: 'artist/listings/new', guard: 'auth' },
  { path: 'payment/result', guard: 'auth' },
  { path: 'favorites', guard: 'auth' },

  // Artist-only — inside <ArtistRoute>.
  { path: 'artist', guard: 'artist' },

  // Catch-all — must stay last in spirit: it absorbs misses.
  { path: '*', guard: 'public' },
]
