# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |
| Earlier versions | No |

## Reporting a Vulnerability

Please report security vulnerabilities privately through GitHub's private vulnerability reporting for this repository: https://github.com/Dfunder/stellarAid-web/security/advisories/new.

If private reporting is unavailable, contact the maintainers directly through GitHub before disclosing the issue anywhere else. Do not report security vulnerabilities in public issues, pull requests, or discussions.

Include the following in your report:

- The affected component and version or commit
- A description of the impact
- Steps to reproduce the issue
- Any proof-of-concept material that does not expose unrelated user data
- Whether you believe the issue is being actively exploited

You should receive an acknowledgement within three business days. Maintainers will provide an update at least every seven days until the report is resolved and will coordinate disclosure timing with the reporter.

## Scope

In scope:

- Wallet signing and transaction submission flows
- Soroban invocation paths
- Authentication and authorization flows
- API gateway behavior
- Access control, validation, and data exposure in this repository

Out of scope:

- Vulnerabilities in the Stellar SDK or Stellar protocol itself; report those to the Stellar Development Foundation
- Issues affecting third-party services not operated by this project
- Publicly known issues that already have an assigned CVE and remediation

Do not include exploit details in public channels.
