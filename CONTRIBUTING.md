# Contributing to StellarAid

Thanks for contributing to StellarAid. This guide covers the local setup, the quality checks and the pull-request workflow.

## Prerequisites

- Node.js 20.9.0 or newer
- npm, included with Node.js
- Git

The project does not commit a lockfile yet, so use `npm install` for a fresh checkout.

## Local setup

```bash
git clone https://github.com/Dfunder/stellarAid-web.git
cd stellarAid-web
npm install
npm run dev
```

Open `http://localhost:3000` to view the app.

Optional environment variables belong in `.env.local`. Start from `.env.example`; the example file documents the placeholders used by the project.

## Scripts and quality gate

Every command below exists in `package.json`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run Vitest with coverage reporting |

Before opening a pull request, run:

```bash
npm run lint
npm test
npm run build
```

There is no separate type-check script yet. TypeScript is checked by the build.

## Accessibility lint rules

`npm run lint` includes the recommended `eslint-plugin-jsx-a11y` rule set in addition to the Next.js defaults. These rules check image alternative text, ARIA roles and properties, interactive element semantics, valid links, heading content and document language. Treat an accessibility lint error like any other build-blocking error and fix it in the component rather than disabling the rule.

## Branches and commits

Create one branch per issue:

```bash
git checkout -b feat/issue-123-short-description
```

Use `feat/` for new behaviour and `fix/` for bug fixes. Keep the branch focused on the linked issue.

Write Conventional Commit messages, for example:

```text
feat: add campaign discovery filters
fix: handle empty campaign list
docs: clarify local setup
```

## Pull requests

- Link the issue with a closing keyword such as `Closes #123`.
- Describe what changed and why, not only which files changed.
- Keep the pull request small and focused; split unrelated work into separate pull requests.
- Include tests or documentation when the change affects behaviour.
- Make sure the local quality gate passes before requesting review.
- Respond to review comments with code changes or a clear explanation.

## Reporting bugs and security issues

Report ordinary bugs through the repository issue tracker. Include the steps to reproduce, the expected result, the actual result and any relevant logs.

Do not report security vulnerabilities in a public issue. Use GitHub's private vulnerability reporting or contact the maintainers directly so the problem can be handled before disclosure.
