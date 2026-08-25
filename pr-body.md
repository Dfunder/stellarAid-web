## Summary

This PR adds dark mode support, a verified artist badge, Stellar Expert transaction links, and a comprehensive CONTRIBUTING.md.

### Changes

**Implement dark mode support (#488)**
- Created ThemeProvider using next-themes with attribute='class' for Tailwind integration
- Created ThemeToggle component with sun/moon icon toggle button
- Theme preference persisted in localStorage automatically by next-themes
- Added ThemeProvider wrapper in root layout
- All existing dark: Tailwind classes now work correctly

**Add verified artist badge component (#487)**
- Created VerifiedBadge component with blue/violet badge and checkmark icon
- Supports three sizes (sm, md, lg) with "Verified" text on larger screens
- Added to FeaturedArtists cards and marketplace service detail artist card
- Badge appears next to artist name with tooltip on hover

**Add Stellar Expert transaction links (#484)**
- Created lib/utils/stellarLinks.ts with utility functions: txLink, accountLink, contractLink, assetLink
- Automatically detects testnet vs mainnet from environment config
- Updated payment history page to use txLink utility

**Write CONTRIBUTING.md for frontend (#489)**
- Local setup instructions with prerequisites
- Environment variable configuration guide
- Project structure overview
- Branch naming conventions (feat/, fix/, chore/, docs/, refactor/)
- Coding standards (TypeScript, React, Tailwind, state management)
- Component conventions with code examples
- Pull request guidelines with checklist
- Links to good first issues

Closes #484
Closes #487
Closes #488
Closes #489
