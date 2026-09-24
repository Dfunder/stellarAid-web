# Lumora Web

Transparent, borderless crowdfunding on the **Stellar Network**. Lumora lets creators launch campaigns, accept donations in XLM or any Stellar-based asset, and verify every contribution on-chain.

This repository is the Lumora web client - React + TypeScript on Vite with strict typing, ESLint, and Prettier.

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
