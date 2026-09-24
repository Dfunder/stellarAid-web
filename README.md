# Lumora Web

Transparent, borderless crowdfunding on the **Stellar Network**. Lumora lets creators launch campaigns, accept donations in XLM or any Stellar-based asset, and verify every contribution on-chain.

This repository is the Lumora web client - React + TypeScript on Vite with strict typing, ESLint, and Prettier.

## Tech Stack

- **React 19** + **TypeScript** (strict, with unchecked indexed access disallowed)
- **Vite** for the dev server and production builds
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

| Script                 | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the Vite dev server with HMR             |
| `npm run build`        | Type-check and build the production bundle     |
| `npm run preview`      | Serve the production build locally             |
| `npm run lint`         | Lint the codebase with ESLint                  |
| `npm run format`       | Format the codebase with Prettier              |
| `npm run format:check` | Check formatting without writing (CI-friendly) |
| `npm run type-check`   | Type-check with `tsc` without emitting output  |

## Environment Variables

Runtime configuration is centralized in `src/config/env.ts` and validated with [Zod](https://zod.dev) at startup. All variables use the `VITE_` prefix and are defined in a `.env` file - copy `.env.example` to get started:

| Variable               | Default                 | Description                             |
| ---------------------- | ----------------------- | --------------------------------------- |
| `VITE_API_URL`         | `http://localhost:4000` | Base URL of the Lumora backend API      |
| `VITE_STELLAR_NETWORK` | `testnet`               | Stellar network: `testnet` or `mainnet` |
| `VITE_APP_URL`         | `http://localhost:5173` | Public URL the web app is served from   |

The development server refuses to start with a clear error message when any variable is missing or invalid. `.env` is git-ignored; only `.env.example` is committed. Never read `import.meta.env` directly outside `src/config/env.ts` - import `{ env }` from `@/config` instead.

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
