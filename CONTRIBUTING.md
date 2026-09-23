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

## Branches & Commits

- Branch names: `feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`
- Prefer small, focused commits; use conventional commit messages (`feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`)

## TypeScript Conventions

- Strict mode is on (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`) - avoid `any` and non-null assertions where possible.
- Import with the `@/` alias: `import { Button } from '@/components/ui'`.
