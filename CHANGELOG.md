# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). See [Releases](./CONTRIBUTING.md#releases) in
`CONTRIBUTING.md` for the release process.

## [Unreleased]

### Added

- `SECURITY.md` with a private vulnerability-reporting path.
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1).
- This changelog and a documented release process.
- `lib/payments` decimal amount helpers and leave the value as a string; `PaymentForm` now
  validates the entered amount against the cart total, shows the total next to the field and
  re-checks it with the server before charging (#995).

### Fixed

- README scripts table now lists every script and describes `type-check` accurately.
- The message sanitizer now removes whole `<script>`/`<style>` elements, so their contents can
  no longer survive as message text; the contact and query forms also reject bodies that are
  empty after sanitization (#989, #991).
- Wallet sign-in signs only the server-issued, single-use challenge; the client-side nonce
  fallback that disabled replay protection is gone and guarded by tests (#990).
- Repaired merge artifacts that left duplicated imports, JSX and helper bodies in several
  modules and blocked `npm run build` and the test suite.

## [0.1.0] - 2026-01-31

### Added

- Initial Lumora web client: React 19 + TypeScript on Vite with Tailwind design tokens, ESLint and Prettier.
- Feature modules for auth (email and Stellar wallet), marketplace, commissions, orders, payments, portfolio,
  profile, messaging, notifications and transactions.
- Typed environment configuration and feature flags.

[Unreleased]: https://github.com/Dfunder/stellarAid-web/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Dfunder/stellarAid-web/releases/tag/v0.1.0
