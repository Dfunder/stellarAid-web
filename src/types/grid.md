# Contributing to Lumora Web

Thanks for contributing! This document explains how the codebase is organized and where new code belongs.

## Prerequisites & Setup

- Node.js `^20.19.0` or `>=22.12.0`
- npm

```bash
npm install
npm run dev
```

## Before You Push

Every change must pass these checks locally:

```bash
npm run lint         # ESLint - zero errors
npm run format:check # Prettier - no unformatted files
npm run type-check   # TypeScript - strict, no errors
npm run test         # Unit tests (Vitest)
npm run build        # Production build
```

Use `npm run format` to fix formatting automatically. Editor setup (format-on-save, ESLint autofix) is described in the [README](./README.md#editor-integrations).

## Folder Structure

```text
src/
├── components/
│   └── ui/                  # Shared presentational design-system components
├── config/                  # Environment and app configuration
├── features/                # Self-contained feature modules
│   ├── auth/
│   ├── commissions/
│   ├── marketplace/
│   ├── messaging/
│   ├── notifications/
│   ├── orders/
│   ├── payments/
│   ├── portfolio/
│   └── profile/
├── hooks/                   # Cross-feature React hooks
├── lib/                     # Framework-agnostic utilities
├── services/                # API clients and external integrations
├── stores/                  # Global state stores
├── types/                   # Shared TypeScript types
├── App.tsx
├── index.css
└── main.tsx
```

## Feature Modules

Each feature is self-contained. Inside a feature folder, use this layout as needed:

```text
features/<feature>/
├── components/   # Components used only by this feature
├── hooks/        # Feature-specific hooks
├── services/     # Feature-specific API calls
├── stores/       # Feature-specific state
├── types.ts      # Feature-specific types
├── utils.ts      # Feature-specific helpers
└── index.ts      # Public entry point (barrel)
```

Rules:

1. `index.ts` is the only import surface for other modules: import `@/features/auth`, never `@/features/auth/components/...`.
2. Keep feature internals private; re-export only what the rest of the app may consume.
3. Cross-feature imports go through feature barrels. If two features need the same code, promote it to `lib/`, `hooks/`, or `types/` instead of importing across features.

## Shared UI Rules

`src/components/ui/` is for presentational, reusable components only:

- Props in, markup and styles out.
- No API calls, no stores, no business rules, no feature imports.
- If a component needs domain data or logic, it belongs in a feature folder; only its generic building blocks (buttons, inputs, modals) live in `ui/`.
- Design-system infrastructure also lives here: `ThemeProvider`/`useTheme`/`ThemeToggle` (theming) and `ErrorBoundary` (recovery). Token definitions live in `tailwind.config.ts` + `src/index.css`; theme helpers that do not touch React are in `src/lib/theme.ts`.

All styling must use design tokens (see the README "Design System & Theming" section) - never arbitrary hex values.

## Where Does New Code Go?

| If your code is...                           | Put it in...                           |
| -------------------------------------------- | -------------------------------------- |
| A presentational, reusable UI building block | `src/components/ui/`                   |
| Specific to one domain (auth, payments, ...) | `src/features/<feature>/`              |
| A generic helper usable anywhere             | `src/lib/`                             |
| A React hook shared by several features      | `src/hooks/`                           |
| An API client or external integration        | `src/services/` or feature `services/` |
| Global application state                     | `src/stores/` or feature `stores/`     |
| A type shared across features                | `src/types/`                           |
| Environment variables, constants, config     | `src/config/`                          |

Anything that does not fit a documented location needs this document updated first (and a discussion in the PR).

## Review Checklist (file placement)

- [ ] Feature-specific code lives under `src/features/<feature>/`
- [ ] Shared components contain no business logic
- [ ] Reused helpers/hooks/types were promoted to the shared folders
- [ ] Imports use the `@/` alias; no deep relative chains (`../../..`)
- [ ] Cross-feature imports use feature barrels only
- [ ] `npm run lint`, `npm run format:check` and `npm run type-check` pass

## Analytics Events

Track product events only through `analytics.track(event, props)` from `@/lib` - never call a vendor SDK from components. A vendor is plugged in once via `analytics.setProvider(...)`; until then a no-op provider is used. In development every event is logged to the console as `[analytics]`.

- Event names are `snake_case` and follow `<object>_<action>` (e.g. `artwork_view`, `checkout_start`), or a single verb for account-level actions (`signup`, `login`).
- New events must be added to the `AnalyticsEvent` union in `src/lib/analytics.ts`.
- Props are flat primitives. Never send PII (emails, wallet addresses, names, tokens); use opaque IDs instead. Keys/values that look like PII are stripped as a safety net.

## Feature Flags

Gate incomplete or risky features with `useFeatureFlag('<flag>')` from `@/hooks` (or `isFeatureEnabled` outside React). Flags are typed: the only valid names are the keys of `FLAG_DEFAULTS` in `src/config/featureFlags.ts`. Every flag defaults to `false`, so missing config hides the feature. Overrides come from `VITE_FF_*` env vars and the remote config stub (remote wins).

Lifecycle:

1. **Add** - add the key to `FLAG_DEFAULTS` (default `false`) plus its `VITE_FF_*` env override, and wrap the new UI in the flag check.
2. **Ship** - turn it on via env/remote config; once stable for everyone, schedule removal.
3. **Remove** - delete the key and env var. TypeScript then flags every remaining `useFeatureFlag('<flag>')` call; delete those checks and the disabled code path in the same PR.

## Auth Tokens

Access and refresh tokens are persisted by `useAuthStore` in `localStorage` so sessions survive reloads. Trade-off: any script running on the origin can read them, so an XSS bug could leak them. This is accepted for the MVP because the API uses bearer tokens; mitigations are short-lived access tokens, transparent refresh on 401 and never rendering untrusted HTML. Move the refresh token to an httpOnly cookie once the API supports it. Do not store tokens anywhere else.

## Branches & Commits

- Branch names: `feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`
- Prefer small, focused commits; use conventional commit messages (`feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`)

## TypeScript Conventions

- Strict mode is on (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`) - avoid `any` and non-null assertions where possible.
- Import with the `@/` alias: `import { Button } from '@/components/ui'`.
