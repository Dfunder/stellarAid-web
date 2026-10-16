# Security Policy

Lumora Web moves real money on the Stellar network and keeps session tokens in the browser, so we take security
reports seriously.

## Supported Versions

Only the latest commit on `main` and the most recent tagged release (currently `0.1.x`) receive security fixes.
Older tags are not patched.

| Version | Supported |
| ------- | --------- |
| `main`  | Yes       |
| `0.1.x` | Yes       |
| `< 0.1` | No        |

## Reporting a Vulnerability

**Please do not open a public issue, pull request or discussion for a security problem.**

Report it privately with GitHub's private vulnerability reporting:

1. Go to the repository's **Security** tab.
2. Choose **Report a vulnerability**
   ([direct link](https://github.com/Dfunder/stellarAid-web/security/advisories/new)).
3. Describe the issue, how to reproduce it, and the impact you expect.

If you cannot use the form, contact the maintainers privately through the
[Dfunder organization on GitHub](https://github.com/Dfunder) and ask for a private channel before sharing details.

Include, where you can: the affected route or file, the commit or version, reproduction steps or a proof of
concept, and whether you believe the issue is already being exploited.

## What To Expect

| Step                          | Target                                                 |
| ----------------------------- | ------------------------------------------------------ |
| Acknowledgement of the report | Within 3 business days                                 |
| Initial assessment            | Within 7 days                                          |
| Fix or mitigation plan        | Within 30 days for confirmed high-severity issues      |
| Public disclosure             | After a fix is released, coordinated with the reporter |

We will credit reporters in the release notes unless you ask us not to.

## Scope

In scope:

- The web client in this repository (`src/`), including routing and route guards, the auth and session code
  (`src/features/auth/`, `src/services/http.ts`), and the payment, checkout and withdrawal flows
  (`src/features/payments/`, `src/features/marketplace/`, `src/features/portfolio/`).
- Handling of tokens, wallet addresses and signed Stellar transactions in the browser.
- Build and configuration, for example a secret leaking into the public bundle through a `VITE_*` variable.

Out of scope:

- Vulnerabilities in third-party dependencies with no demonstrable impact on this app (report those upstream).
- The Lumora backend API and the Stellar network itself.
- Findings that need a rooted device, physical access, or a user pasting attacker-controlled script into their own
  console.
- Missing security headers on a local development server, and denial-of-service by volume.

## Known, Accepted Risk

Access and refresh tokens are stored in `localStorage` so sessions survive reloads, which means an XSS bug on the
origin could leak them. This trade-off and its mitigations are described in
[CONTRIBUTING.md](./CONTRIBUTING.md#auth-tokens). An XSS report is still in scope and valuable.
