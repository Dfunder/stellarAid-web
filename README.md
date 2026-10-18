# Lumora Web

Lumora is an art marketplace on the **Stellar Network**. Artists list artwork and take commissions, buyers pay in XLM or any Stellar-based asset, and orders move through escrow, deliverables and payouts.

This repository is the Lumora web client - React + TypeScript on Vite with strict typing, ESLint, and Prettier.

## Features

- **Accounts** - email sign-up, sign-in and password reset with email verification, plus Stellar wallet connection and linked-wallet management (Freighter).
- **Marketplace** - browse artwork by category, view artist profiles, favorite pieces, and check out with a Stellar payment.
- **Listings** - artists create, edit and manage artwork listings with multi-asset pricing, and upload deliverables.
- **Commissions & escrow** - orders are tracked through an escrow status flow from payment to delivery.
- **Payments** - asset selection, wallet balance display, transaction signing, status polling and a payment result screen.
- **Orders & earnings** - purchase history, order confirmation, transaction history and artist withdrawals.
- **Profiles** - public artist pages with reviews, stats and favorites, and profile editing.
- **Messaging & notifications** - behind the `VITE_FF_MESSAGING` and `VITE_FF_NOTIFICATIONS` feature flags.
- **Theming** - light and dark themes driven by design tokens.

## Routes

Routes are declared in `src/App.tsx`. "Auth" means the route is wrapped in `RequireAuth`; "Guest" means it is only
for signed-out users. `src/docs.test.ts` fails if this table and the router drift apart.

| Path                               | Access | Screen                   |
| ---------------------------------- | ------ | ------------------------ |
| `/`                                | Public | Landing page             |
| `/login`                           | Guest  | Sign in                  |
| `/register`                        | Guest  | Create an account        |
| `/forgot-password`                 | Guest  | Request a password reset |
| `/reset-password`                  | Guest  | Set a new password       |
| `/verify-email`                    | Public | Verify an email address  |
| `/artists/:username`               | Public | Artist profile           |
| `/category/:slug`                  | Public | Category landing page    |
| `/profile/edit`                    | Auth   | Edit your profile        |
| `/dashboard`                       | Auth   | Dashboard                |
| `/artist`                          | Artist | Artist dashboard         |
| `/artist/listings`                 | Auth   | My listings              |
| `/artist/listings/new`             | Auth   | Create a listing         |
| `/artist/listings/:listingId/edit` | Auth   | Edit a listing           |
| `/checkout/:artworkId`             | Auth   | Checkout                 |
| `/payment/result`                  | Auth   | Payment result           |
| `/order/confirmation`              | Auth   | Order confirmation       |
| `/purchases`                       | Auth   | Purchase history         |
| `/favorites`                       | Auth   | Favorites                |
| `/transactions`                    | Auth   | Transaction history      |
| `/earnings/withdraw`               | Auth   | Withdraw earnings        |
| `/settings/wallets`                | Auth   | Linked wallets           |
| `/style-guide`                     | Dev only | Design system reference |
| `*`                                | Public | Not found                |

## Tech Stack

- **React 19** + **TypeScript** (strict, with unchecked indexed access disallowed)
- **Vite** for the dev server and production builds
- **Tailwind CSS** (PostCSS + Autoprefixer) with a tokenized theme
- **ESLint** (flat config) + **Prettier** for linting and formatting
- `@/` path alias mapped to `src/`

## Getting Started

Requirements: Node.js `^20.19.0` or `>=22.12.0`, and npm.

```bash
npm install
npm run dev
```

The app is served at `http://localhost:5173`.

## Scripts

| Script                 | Description                                                                       |
| ---------------------- | --------------------------------------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server with HMR                                                |
| `npm run build`        | Type-check and build the production bundle                                        |
| `npm run preview`      | Serve the production build locally                                                |
| `npm run lint`         | Lint the codebase with ESLint                                                     |
| `npm run format`       | Format the codebase with Prettier                                                 |
| `npm run format:check` | Check formatting without writing (CI-friendly)                                    |
| `npm run type-check`   | Run `tsc -b` (a project-references build; the same type check `build` runs first) |
| `npm run test`         | Run the Vitest unit and component tests once                                      |
| `npm run prepare`      | Installs the Husky git hooks (runs automatically on `npm install` / `npm ci`)     |

## Environment Variables

Runtime configuration is centralized in `src/config/env.ts` and parsed with [Zod](https://zod.dev). All variables use
the `VITE_` prefix and are defined in a `.env` file - copy `.env.example` to get started.

> **Warning: every `VITE_*` value is public.** Vite inlines these values into the client bundle at build time, so
> anyone who loads the site can read them. Never put a secret (API keys, signing keys, passwords) in a `VITE_*`
> variable; secrets belong on a server.

| Variable                   | Default                 | Required           | Description                                                   |
| -------------------------- | ----------------------- | ------------------ | ------------------------------------------------------------- |
| `VITE_API_URL`             | `http://localhost:4000` | Dev: yes. Prod: no | Base URL of the Lumora backend API                            |
| `VITE_STELLAR_NETWORK`     | `testnet`               | Dev: yes. Prod: no | Stellar network: `testnet` or `mainnet`                       |
| `VITE_APP_URL`             | `http://localhost:5173` | Dev: yes. Prod: no | Public URL the web app is served from                         |
| `VITE_FF_MESSAGING`        | unset (flag is off)     | No                 | Feature flag override for messaging: `true` or `false`        |
| `VITE_FF_NOTIFICATIONS`    | unset (flag is off)     | No                 | Feature flag override for notifications: `true` or `false`    |
| `VITE_FF_ADVANCED_FILTERS` | unset (flag is off)     | No                 | Feature flag override for advanced filters: `true` or `false` |

The flag variables accept only `true` or `false`; anything else counts as unset, which leaves the flag at its safe
default (off). See `src/config/featureFlags.ts`.

### How validation actually behaves

Validation is gated on `import.meta.env.DEV` in `src/config/env.ts`:

- **Development (`npm run dev`)**: a missing or invalid `VITE_API_URL`, `VITE_STELLAR_NETWORK` or `VITE_APP_URL` is
  reported with a clear message and `main.tsx` renders `ConfigErrorScreen` instead of the app. The dev server itself
  still starts; it is the page that refuses to render.
- **Production builds**: nothing is required. Anything missing falls back to its default. An invalid value (for
  example a malformed URL) makes `envSchema.parse` throw while the module loads, **before** `main.tsx` can read
  `configError`, so the user gets a blank page rather than `ConfigErrorScreen`.

Two defaults are footguns in production:

- `VITE_STELLAR_NETWORK` silently defaults to **`testnet`**. A mainnet deployment that forgets this variable runs on
  testnet with no warning.
- `VITE_API_URL` defaults to **`http://localhost:4000`**, so a production build without it points every request at
  the visitor's own machine.

Always set all three explicitly in your deployment environment. Making production fail closed is tracked as a
follow-up.

`.env` is git-ignored; only `.env.example` is committed. Never read `import.meta.env` directly outside
`src/config/env.ts` - import `{ env }` from `@/config` instead.

## Design System & Theming

Styling is built on a tokenized Tailwind theme so every color, radius, shadow, and type size comes from a design token instead of an ad-hoc value.

- **Semantic colors** (`bg-background`, `text-foreground`, `border-line`, `bg-primary`, ...) are CSS variables defined in `src/index.css` in two palettes - light and dark. Dark mode is activated via `data-theme="dark"` on `<html>`.
- **Brand palettes** (`brand-purple-*`, `brand-gold-*`, `neutral-*`) are exposed as utilities such as `bg-brand-purple-600`, `bg-brand-gold-500`, `bg-neutral-900`.
- **Typography** uses a single ramp (`text-display`, `text-h1` … `text-caption-sm`) defined in `tailwind.config.ts`, applied to headings automatically; sizes are fluid between mobile and desktop.
- **Radii & shadows**: `rounded-control`, `rounded-card`, `shadow-card`, `shadow-elevated`, `shadow-focus-ring`.
- **Container**: use `container` for a centered, padded layout with responsive max widths.

### Theming

The theme is resolved before first paint by the inline script in `index.html` (no flash) and managed at runtime by `ThemeProvider`:

- First visit follows the OS preference via `prefers-color-scheme`.
- `ThemeToggle` switches light/dark and persists the choice in `localStorage` under `lumora-theme`.
- The choice survives reloads; `useTheme()` (`@/components/ui`) exposes `theme`, `setTheme`, and `toggleTheme`.

Never use raw hex values in components - import tokens from `@/components/ui` or `@/lib/theme` and style with the utility classes above.

## Editor Integrations

VS Code: accept the recommended extensions when prompted (also pinned in `.vscode/extensions.json`):

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

`.vscode/settings.json` sets Prettier as the default formatter and enables format-on-save plus ESLint autofix, so saved files always match `npm run format:check`.

Other editors (WebStorm, Neovim, etc.): enable "Format on save" with Prettier and point the ESLint plugin at the flat config at `eslint.config.js`.

## Project Structure

The codebase is organized by feature - each domain is self-contained:

```
src/
├── components/ui/     # Shared, presentational design-system components
├── config/            # App configuration (env, constants)
├── features/          # Feature modules (auth, portfolio, marketplace, ...)
├── hooks/             # Cross-feature React hooks
├── lib/               # Framework-agnostic utilities
├── services/          # API clients and external integrations
├── stores/            # Global state stores
└── types/             # Shared TypeScript types
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for placement rules and conventions.

## Community & Security

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security policy](./SECURITY.md) - report vulnerabilities privately, never in a public issue
- [Changelog](./CHANGELOG.md)

## License

Licensed under the [MIT License](./LICENSE).
