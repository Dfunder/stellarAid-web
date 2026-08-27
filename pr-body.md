# PR: [Performance] Lighthouse Score Optimization (Target: 90+)

## Summary of Changes

This pull request addresses frontend performance bottlenecks affecting Core Web Vitals (Largest Contentful Paint, Cumulative Layout Shift, Total Blocking Time, and First Input Delay/Interaction to Next Paint) to elevate the Lighthouse audit score from **~45 to 90+**.

---

## Key Improvements

### 1. Largest Contentful Paint (LCP)

- **Zero-Block Font Loading**: Configured Next.js native `Inter` font loader in `app/layout.tsx` with `display: 'swap'`, `preload: true`, and `variable: '--font-inter'`.
- **Preconnect Resource Hints**: Added preconnect and DNS-prefetch link tags in `app/layout.tsx` for external asset CDNs (`images.unsplash.com`).
- **Instant Hero Render**: Removed artificial client-mount delay in `app/components/landing/Hero.tsx` (`setTimeout 80ms` + `opacity-0`), allowing the primary `<h1>` headline to paint immediately on SSR and initial load.
- **Modern Image Compression**: Enabled Next.js modern image compression formats (`image/avif`, `image/webp`) with `minimumCacheTTL: 60` in `next.config.js`.

### 2. Cumulative Layout Shift (CLS)

- **Shimmer Blur Placeholders**: Fixed `components/common/FallbackImage.tsx` by removing premature return logic to restore shimmer skeleton placeholders and blur data URLs while remote images load.
- **Dynamic Stream Skeletons**: Added reserved-height skeleton placeholders for lazy-loaded below-the-fold components in `app/page.tsx` (`CategoriesShowcase`, `FeaturedArtists`, `HowItWorks`).
- **Explicit Sizing & Aspect Ratios**: Enforced reserved containers on avatars, artwork cards, and navigation bars to prevent layout shifts.

### 3. Total Blocking Time (TBT) & FID / INP

- **Code Splitting & Dynamic Imports**: Dynamically imported below-the-fold sections in `app/page.tsx` using `next/dynamic` to reduce initial JS payload and optimize main thread execution.
- **Package Import Optimization**: Enabled `experimental.optimizePackageImports` in `next.config.js` for heavy libraries (`lucide-react`, `framer-motion`, `@reduxjs/toolkit`, `date-fns`).
- **Passive Event Listeners**: Added `{ passive: true }` to window scroll listeners in `app/components/layout/Header.tsx` to prevent scroll-blocking penalties.

### 4. Accessibility & IDE Code Quality

- **Button Types**: Added explicit `type="button"` attributes across `Header.tsx`, `ExploreProjects.tsx`, and `artists/[id]/page.tsx`.
- **Readonly Props**: Applied `Readonly<Props>` to `Hero.tsx`, `ExploreProjects.tsx`, `RootLayout`, and `FallbackImage.tsx`.
- **Refactored Nested Ternaries**: Cleaned up complex conditionals in `app/artists/[id]/page.tsx` with a typed helper function (`getErrorMessage`).

---

## File Changes Summary

| Area                    | File(s)                                                                                                                                   | Description                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Core Layout & Fonts** | `app/layout.tsx`                                                                                                                          | Font swap configuration, preconnect headers, readonly props      |
| **Next.js Config**      | `next.config.js`                                                                                                                          | AVIF/WebP formats, package import optimizations, API compression |
| **Landing Page**        | `app/page.tsx`, `app/components/landing/Hero.tsx`                                                                                         | Instant LCP render, dynamic imports with zero-CLS skeletons      |
| **Common Components**   | `components/common/FallbackImage.tsx`, `app/components/layout/Header.tsx`                                                                 | Shimmer blur restore, passive scroll listeners, button types     |
| **Artists & Explore**   | `app/artists/[id]/page.tsx`, `app/explore/components/ExploreProjects.tsx`                                                                 | Nested ternary refactor, explicit button types, readonly props   |
| **Testing & CI**        | `components/landing/__tests__/Hero.test.tsx`, `components/landing/__tests__/PerformanceOptimization.test.tsx`, `.github/workflows/ci.yml` | 9 new unit tests, CI validation workflow                         |

---

## Verification Results

|  #  | Check / Command                          |  Status   | Details                                          |
| :-: | ---------------------------------------- | :-------: | ------------------------------------------------ |
|  1  | **Type Check**: `npm run type-check`     | ✅ PASSED | `tsc --noEmit` exited with code 0 (0 errors)     |
|  2  | **Lint**: `npm run lint`                 | ✅ PASSED | `next lint` exited with code 0 (0 errors)        |
|  3  | **Format Check**: `npm run format:check` | ✅ PASSED | `prettier --check` verified all matched files    |
|  4  | **Unit Tests**: `npm test`               | ✅ PASSED | 24/24 tests passing across 5 test suites         |
|  5  | **Production Build**: `npm run build`    | ✅ PASSED | 34/34 routes successfully built with zero errors |
