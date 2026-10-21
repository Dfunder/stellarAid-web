# Architecture

How the code is organised and why. The rules themselves are in [CONTRIBUTING.md](../CONTRIBUTING.md); this document
explains the shape they produce and lists the places where the codebase currently breaks them.

## Layers and dependency direction

Dependencies point **down** this list only. A layer may import from layers below it, never from layers above it.

```text
main.tsx / App.tsx        application shell: providers, routes, error boundary
        |
        v
features/<feature>/       self-contained domain modules (auth, payments, marketplace, ...)
        |
        v
components/ui, hooks      presentational design system; cross-feature hooks
        |
        v
services, stores          http client, query client, global UI store
        |
        v
config, lib, types        environment, constants, framework-agnostic utilities, shared types
```

Features sit side by side and do not import each other's internals. When two features need the same code it is
promoted down a layer (`lib/`, `hooks/`, `types/`, `components/ui/`) instead of one feature reaching into the other.

## The rules and why they exist

1. **A feature's `index.ts` (its barrel) is the only import surface.** Other modules import `@/features/auth`, never
   `@/features/auth/components/...`. This lets a feature reorganise its internals without touching its consumers and
   makes the public surface obvious.
2. **Cross-feature imports go through barrels.** It keeps the feature graph legible and prevents cycles caused by
   one feature reaching into another's private files.
3. **`components/ui` is presentational.** Props in, markup out: no API calls, no stores, no business rules, no
   feature imports. That keeps the design system reusable and testable in isolation, and keeps it at the bottom of
   the dependency graph so features can use it freely.
4. **Design tokens only.** Colours, radii, shadows and type sizes come from the Tailwind theme, never from raw hex
   values, so light/dark theming and re-skinning stay one-place changes.
5. **Undocumented locations need a doc update first.** Where new code goes should never be a guess; if no row in
   "Where Does New Code Go?" fits, the table is extended in the same PR.

## API errors

Every failed API call is normalized into one shape (`ApiErrorResponse` in `src/types/api-error.ts`):

```ts
{ code: string; message: string; statusCode: number | null; timestamp: string }
```

`services/http.ts` produces it from the envelopes the backend and its gateways actually send (`{ message }`,
`{ error }`, short plain text, HTML error pages), and `ApiError` implements the contract so `code`, `message`,
`statusCode` and `timestamp` are always present. Errors that never reached a server use `statusCode: null`.

At a boundary that may throw (`toApiErrorResponse`, `withErrorHandling` in `src/lib/api-errors.ts`), call
`withErrorHandling` to get a discriminated result instead of a thrown error, and `toApiErrorResponse` to log or
report the canonical payload. Do not format errors ad hoc in components; read `message` from the normalized error.

## Known exceptions

These seven deep imports (they bypass a feature barrel) exist today. (`main.tsx` and `services/http.ts` no longer reach into feature internals.) They are tolerated, not endorsed: each lists why it
exists and what would remove it.

| Importer                                       | Imports                                                                    | Why it exists                                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `features/payments/PaymentAssetSelector.tsx`   | `@/features/auth/hooks/useWallet`                                          | The wallet hook is not exported from the `auth` barrel; payments needs the connected wallet. |
| `features/payments/TransactionSigningFlow.tsx` | `auth/hooks/useWallet`, `auth/services/wallets`, `auth/stores/walletStore` | Signing needs the wallet connection and signer, which `auth` keeps private.                  |
| `features/payments/WalletBalanceDisplay.tsx`   | `@/features/auth/hooks/useWallet`                                          | Same as `PaymentAssetSelector`.                                                              |
| `features/portfolio/ArtistWithdrawal.tsx`      | `@/features/auth/types` (`LinkedWallet`)                                   | The linked-wallet type is not re-exported from the `auth` barrel.                            |
| `features/profile/types.ts`                    | `@/features/auth/types` (`UserRole`)                                       | `UserRole` lives with the auth types; profile reuses it.                                     |
| `features/profile/hooks/useUpdateProfile.ts`   | `auth/stores/authStore`, `auth/stores/useAuthStore`                        | Updating a profile must refresh the signed-in user held in the auth stores.                  |
| `features/profile/services/profileService.ts`  | `@/features/auth/types` (`User`)                                           | The `User` model is defined by `auth`.                                                       |

The first three can be removed by exporting `useWallet` (and the signer helpers) from the `auth` barrel; the type
imports by promoting `LinkedWallet`, `User` and `UserRole` to `src/types`.

## Tests next to code

Unit and component tests live beside the file they cover (`Foo.tsx` / `Foo.test.ts`). Pure logic belongs in `lib/`
or a feature `utils.ts` so it can be tested without rendering.
