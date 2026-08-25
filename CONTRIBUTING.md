# Contributing to StellarAid (Lumora)

Thank you for your interest in contributing to StellarAid! This guide will help you get started with local development, coding standards, and the contribution workflow.

## Table of Contents

- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Branch Naming](#branch-naming)
- [Coding Standards](#coding-standards)
- [Component Conventions](#component-conventions)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Good First Issues](#good-first-issues)

---

## Local Setup

### Prerequisites

- **Node.js** 18+ (推荐 20 LTS)
- **npm** 9+ or **yarn** 1.22+
- **Git**
- **Freighter Browser Extension** (for wallet features)

### Getting Started

1. **Fork the repository** on GitHub.

2. **Clone your fork:**
   ```bash
   git clone https://github.com/<your-username>/stellarAid-web.git
   cd stellarAid-web
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/Dfunder/stellarAid-web.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Copy the environment file:**
   ```bash
   cp .env.example .env.local
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Useful Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run format` | Format code with Prettier |
| `npm run cypress:open` | Open Cypress E2E tests |

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Authentication
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

> **Important:** Never commit `.env.local` or any file containing secrets. The `.gitignore` is configured to exclude these files.

---

## Project Structure

```
stellarAid-web/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard pages
│   ├── artists/            # Artist discovery pages
│   ├── auth/               # Authentication pages
│   ├── commissions/        # Commission management
│   ├── dashboard/          # User dashboards (artist, client)
│   ├── explore/            # Project exploration
│   ├── marketplace/        # Marketplace services
│   ├── portfolio/          # Portfolio views
│   ├── settings/           # User settings
│   ├── features/           # Redux slices & thunks
│   ├── providers/          # Context providers
│   └── components/         # Page-level components
├── components/             # Shared UI components
│   ├── analytics/          # Charts and analytics
│   ├── commissions/        # Commission-related components
│   ├── common/             # Generic reusable components
│   ├── landing/            # Landing page sections
│   └── wallet/             # Wallet connection & balance
├── constants/              # App-wide constants
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and API helpers
│   ├── api/                # API function wrappers
│   ├── stellar/            # Stellar/Soroban utilities
│   └── utils/              # General utilities
├── stores/                 # Zustand stores
├── types/                  # TypeScript type definitions
└── utils/                  # Additional utilities
```

---

## Branch Naming

Use descriptive branch names with the following prefixes:

| Prefix | Usage | Example |
|--------|-------|---------|
| `feat/` | New features | `feat/dark-mode-toggle` |
| `fix/` | Bug fixes | `fix/wallet-balance-refresh` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Code refactoring | `refactor/commission-hooks` |

---

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Avoid `any` type; use proper types or `unknown` with type guards
- Define interfaces for component props
- Use discriminated unions for complex state

### React / Next.js

- Use functional components with hooks
- Mark client components with `'use client'` directive when needed
- Use Next.js App Router conventions
- Prefer Server Components when no interactivity is needed

### Styling

- Use **Tailwind CSS** utility classes
- Follow the existing design system colors (`primary`, `secondary`, `accent`, `neutral`)
- Support dark mode with `dark:` variants
- Maintain responsive design with mobile-first approach

### State Management

- Use **Redux Toolkit** for global state (auth, services, commissions)
- Use **React Query** for server state and caching
- Use **Zustand** for simple client-only state
- Prefer hooks over direct store access

### Error Handling

- Use toast notifications for user-facing errors (`utils/toast.ts`)
- Log errors to console in development
- Provide meaningful error messages

---

## Component Conventions

### File Naming

- Components: `PascalCase.tsx` (e.g., `WalletBalance.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useWalletBalance.ts`)
- Utilities: `camelCase.ts`
- Types: `camelCase.ts` or grouped in `types/` directory

### Component Structure

```tsx
'use client';

import { useState } from 'react';
import { SomeIcon } from 'lucide-react';

interface MyComponentProps {
  title: string;
  onSelect: (id: string) => void;
}

export default function MyComponent({ title, onSelect }: MyComponentProps) {
  // State
  // Effects
  // Handlers
  // Render
  return (
    <div className="...">
      {/* Content */}
    </div>
  );
}
```

### Testing

- Write tests for new components and utilities
- Use Vitest + React Testing Library
- Test user interactions and edge cases
- Keep test files adjacent to source files with `.test.tsx` suffix

---

## Pull Request Guidelines

### Before Submitting

1. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks:**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

3. **Format your code:**
   ```bash
   npm run format
   ```

### PR Checklist

- [ ] Branch is created from `upstream/main`
- [ ] Code follows the project's coding standards
- [ ] New components have proper TypeScript types
- [ ] Dark mode support is included (`dark:` variants)
- [ ] Responsive design is considered
- [ ] No console errors or warnings
- [ ] Tests pass
- [ ] PR description explains the changes clearly
- [ ] Related issues are linked (e.g., `Closes #123`)

### PR Description Template

```markdown
## Summary
Brief description of changes.

## Changes
- Change 1
- Change 2

## Testing
How to test these changes.

Closes #issue_number
```

---

## Good First Issues

Looking for ways to contribute? Check out these beginner-friendly issues:

- [Browse "good first issue" label](https://github.com/Dfunder/stellarAid-web/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- [Browse "help wanted" label](https://github.com/Dfunder/stellarAid-web/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)

---

## Questions?

Feel free to open a discussion or reach out on the project's communication channels. We're happy to help!

**Thank you for contributing to StellarAid!**
