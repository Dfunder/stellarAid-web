# Environment variables

StellarAid reads environment configuration at build and runtime. Values prefixed with `NEXT_PUBLIC_` are embedded in the browser bundle. They are visible to every visitor and must never contain secrets, seeds, signing keys, service keys, database URLs, or Redis URLs.

Copy `.env.example` to `.env.local` for local development. Use placeholders only; do not commit real credentials.

## Public variables

| Variable | Purpose | Default | Example |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Identifies the Stellar network used by the application | None | `testnet` |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | RPC endpoint used for Soroban reads | None | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL used by existing health and campaign helpers | `http://localhost:3001` in campaign services; unset elsewhere | `https://api.example.com` |
| `NEXT_PUBLIC_SITE_URL` | Canonical deployment URL used by `robots.ts` | Falls back to `VERCEL_URL`, then no indexing | `https://stellaraid.vercel.app` |

These values are safe to expose only because they are endpoints or identifiers, not credentials. If a value becomes sensitive, move it to a server-only variable without the `NEXT_PUBLIC_` prefix.

## Server-only variables

| Variable | Purpose | Default | Example |
| --- | --- | --- | --- |
| `API_URL` | Internal campaign API URL read by server-side code | Empty string | `https://api.internal.example.com` |
| `SIGNING_SECRET` | Reserved for future transaction-signing configuration | None | `replace-with-secret` |
| `DATABASE_URL` | Reserved for future database access | None | `postgres://user:password@localhost:5432/stellaraid` |
| `REDIS_URL` | Reserved for future cache or queue access | None | `redis://localhost:6379` |
| `VERCEL_URL` | Deployment hostname supplied automatically by Vercel | None | `stellaraid-git-main.vercel.app` |

Never prefix any variable in this table with `NEXT_PUBLIC_`.

## Build-only variables

| Variable | Purpose | Default | Example |
| --- | --- | --- | --- |
| `ANALYZE` | Enables the bundle analyzer when set to `true` | `false` | `true` |
| `npm_package_version` | Package version injected by npm | `unknown` | `0.1.0` |

Build-only values are available during tooling and server rendering. They are not a safe place for secrets that must remain unavailable to build processes.
