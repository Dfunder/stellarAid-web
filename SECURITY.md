# Security Policy

Lumora Web is a financial application: it holds wallet connection, payment, and identity
data, and runs on the public Stellar network. We treat security reports as confidential.

## Reporting a vulnerability

Do **not** open a public issue, PR, or Discussion for a security vulnerability.

Instead, report it privately and directly. All of the following work:

- A [private security advisory](https://github.com/Dfunder/stellarAid-web/security/advisories/new)
  in this repository (preferred), or
- A direct DM to the repository owner

Please include, if possible:

- What the issue is and its impact
- Where it lives (file + line, or the route/flow affected)
- A minimal reproduction (steps or a PoC snippet)
- The affected version/branch and network (Testnet/Mainnet)

We aim to acknowledge reports within 2 business days and to ship a fix as a private
patch before disclosure. When reporting, you agree not to exploit the issue in a live
site, not to exfiltrate data beyond what is needed to demonstrate it, and to give us
reasonable time to fix before public disclosure.

## Supported versions

Only the latest `main` branch is supported. Reported issues affecting `main` receive
fixes first; older or unpublished branches are not security-supported.