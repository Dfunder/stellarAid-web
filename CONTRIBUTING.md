# Contributing to Lumora Web

Thanks for contributing! This document explains how the codebase is organized and where new code belongs.

By participating you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md). Report security problems privately as described in [SECURITY.md](./SECURITY.md), never in a public issue.

## Prerequisites & Setup

- Node.js `^20.19.0` or `>=22.12.0` (declared in `package.json` `engines`; `.nvmrc` pins `22.12.0`, so `nvm use` picks a supported version)
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

## Git Hooks

[Husky](https://typicode.github.io/husky/) installs two git hooks from `.husky/`. The `prepare` script
(`husky`) runs on every `npm install` / `npm ci`, so the hooks are (re)installed whenever dependencies are.

| Hook         | Runs                                                                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pre-commit` | `npx lint-staged`: `eslint --fix` + `prettier --write` on staged `*.ts`/`*.tsx`, `prettier --write` on staged `*.css`, `*.html`, `*.json`, `*.md`, `*.yml` / `*.yaml` (configured under `lint-staged` in `package.json`) |
| `pre-push`   | `npm run type-check` (`tsc -b`), then `npm test --if-present`                                                                                                                                                            |

**Known gap:** the hooks do **not** run `npm run lint` over the whole repo, `npm run format:check` or
`npm run build`, even though [Before You Push](#before-you-push) lists them as required. Run those yourself. A push
is rejected if the type check or the tests fail; if `main` itself fails the type check, every push is blocked until
it is fixed.

To skip the hooks temporarily (for example to push a work-in-progress branch), use `git push --no-verify` /
`git commit --no-verify`, or set `HUSKY=0` for a single command (`HUSKY=0 git push`). CI-style checks still
apply, so do not rely on this for finished work.

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
│   ├── profile/
│   └── transactions/
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

Anything that does not fit a documented location needs this document updated first (and a discussion in the PR). See [docs/architecture.md](./docs/architecture.md) for the dependency direction behind these rules and the known exceptions.

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

## Environment Variables

Every `VITE_*` variable is inlined into the public client bundle at build time and can be read by any visitor. Never add a secret under that prefix; secrets belong on a server. The full variable list, defaults and validation behaviour are in the [README](./README.md#environment-variables).

## Auth Tokens

Access and refresh tokens are persisted by `useAuthStore` in `localStorage` so sessions survive reloads. Trade-off: any script running on the origin can read them, so an XSS bug could leak them. This is accepted for the MVP because the API uses bearer tokens; mitigations are short-lived access tokens, transparent refresh on 401 and never rendering untrusted HTML. Move the refresh token to an httpOnly cookie once the API supports it. Do not store tokens anywhere else.

## Untrusted URLs

Two helpers in `src/lib/url.ts` guard every URL the app does not control. Use them instead of passing a raw string to `navigate`, `href` or `src`:

- `safeRedirect` (via `resolvePostLoginRedirect`) for a post-login destination. It only accepts an app-relative path that stays on this origin, so `//evil.com`, `/\evil.com` and `/%2F%2Fevil.com` all fall back to the dashboard. Router state is attacker-influenceable: narrow it field by field instead of asserting a type.
- `safeExternalUrl` for a server-supplied URL rendered as a link or an image source. It returns `null` for anything that is not `https:` (plus `http:` in development), so render a non-clickable fallback instead of the URL.
- `redactUrl` before a URL reaches `console.*` or an analytics payload - a password-reset token travels in the path.

Interpolate every path parameter with `encodeURIComponent`, and set `skipToast: true` on background polls and probes so a retry loop cannot spam the user with toasts.

## Releases

Versions follow [Semantic Versioning](https://semver.org) and the changelog follows
[Keep a Changelog](https://keepachangelog.com): see [CHANGELOG.md](./CHANGELOG.md).

- **Cadence:** a release is cut when a meaningful set of changes has landed on `main` (roughly every two to four
  weeks while the app is `0.x`); security fixes are released as soon as they are ready.
- **Versioning:** while `0.x`, a breaking change bumps the minor version and anything else bumps the patch. After
  `1.0.0`, breaking changes bump the major version.
- **Updating the changelog:** every user-visible change adds a line under `## [Unreleased]` in the same PR, in
  the matching `Added` / `Changed` / `Fixed` / `Removed` / `Security` group. Entries are derived from the
  conventional commit type (`feat` -> Added, `fix` -> Fixed).
- **Cutting a release:** rename `Unreleased` to the new version with the date, add a fresh empty `Unreleased`
  section, bump `version` in `package.json`, update the compare links at the bottom of the changelog, then tag
  `vX.Y.Z` and publish a GitHub release using that changelog section as the notes.

## Branches & Commits

- Branch names: `feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`
- Prefer small, focused commits; use conventional commit messages (`feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`)

## TypeScript Conventions

- Strict mode is on (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`) - avoid `any` and non-null assertions where possible.
- Import with the `@/` alias: `import { Button } from '@/components/ui'`.
