# Environment Variables

This project uses `.env.local` for local secrets and `.env.example` as a
committed template. Follow the steps below to get started.

---

## Quick Start

```bash
cp .env.example .env.local
# Fill in the values in .env.local
```

`.env.local` is listed in `.gitignore` and **must never be committed**.

---

## Variable Reference

### API

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Base URL of your backend API (e.g. `http://localhost:3001`) |

---

### Stellar Network

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_STELLAR_NETWORK` | ✅ | Network to use: `testnet` \| `mainnet` \| `futurenet` |
| `NEXT_PUBLIC_STELLAR_HORIZON_URL` | ✅ | Horizon server URL. Testnet default: `https://horizon-testnet.stellar.org` |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | ✅ | Soroban RPC endpoint. Testnet default: `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` | ✅ | Network passphrase (must match chosen network) |

**Passphrases:**

| Network | Passphrase |
|---|---|
| Testnet | `Test SDF Network ; September 2015` |
| Mainnet | `Public Global Stellar Network ; September 2015` |

---

### Wallet

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ⬜ | WalletConnect project ID — get one at [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `NEXT_PUBLIC_FREIGHTER_APP_NAME` | ⬜ | App name shown to users in the Freighter browser extension |
| `NEXT_PUBLIC_ALBEDO_REDIRECT_URL` | ⬜ | OAuth redirect URL registered in your Albedo dashboard |
| `NEXT_PUBLIC_LOBSTR_APP_ID` | ⬜ | Application ID for LOBSTR vault integration |
| `NEXT_PUBLIC_RABET_NETWORK` | ⬜ | Rabet network override (`TESTNET` \| `MAINNET`) |

---

### Third-Party Services

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_ANCHOR_URL` | ⬜ | SEP-6/SEP-24 anchor endpoint |
| `NEXT_PUBLIC_COINGECKO_API_KEY` | ⬜ | CoinGecko API key (free tier works without one, but is rate-limited) |
| `NEXT_PUBLIC_SENTRY_DSN` | ⬜ | Sentry project DSN for error tracking |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⬜ | Google Analytics 4 measurement ID |

---

### Server-Only (never exposed to the browser)

| Variable | Required | Description |
|---|---|---|
| `AUTH_SECRET` | ✅ | Secret key for signing JWTs / sessions. Must be ≥ 32 characters. Generate with `openssl rand -hex 32` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/mydb` |
| `STELLAR_ADMIN_SECRET_KEY` | ⬜ | Stellar secret key (starts with `S`) used for server-side transaction signing |
| `REDIS_URL` | ⬜ | Redis connection URL for rate-limiting / caching |

---

## Validation

Environment variables are validated at **build time and server startup** via
`src/lib/env.ts`. If a required variable is missing or fails its format check
the build will exit with a clear error message, e.g.:

```
[env] Build failed — required environment variables are missing or invalid:
  ❌ Missing required variable: NEXT_PUBLIC_API_URL — Base URL for the backend API
  ❌ Invalid value for NEXT_PUBLIC_STELLAR_NETWORK: Must be one of: testnet | mainnet | futurenet

Copy .env.example to .env.local and fill in the required values.
```

### Using the typed `env` accessor

```ts
import { env } from '@/lib/env';

// Fully typed – TypeScript will error if you typo a key
const apiUrl = env.NEXT_PUBLIC_API_URL;
const network = env.NEXT_PUBLIC_STELLAR_NETWORK; // "testnet" | "mainnet" | "futurenet"
```

### Getting Stellar config in one call

```ts
import { getStellarConfig } from '@/lib/env';

const { horizonUrl, networkPassphrase } = getStellarConfig();
```

---

## Client vs Server Variables

| Prefix | Visible in browser? | Use for |
|---|---|---|
| `NEXT_PUBLIC_` | ✅ Yes | Anything the frontend needs |
| *(no prefix)* | ❌ No | Secrets, DB credentials, signing keys |

> **Warning:** Never store private keys, database passwords, or other secrets in
> `NEXT_PUBLIC_` variables — they will be embedded in the JavaScript bundle and
> visible to anyone.
