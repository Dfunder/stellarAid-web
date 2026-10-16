/**
 * Theme access hook. It lives with the other cross-feature hooks (not in the `components/ui` barrel, which would mix a
 * hook with components); the implementation stays beside `ThemeProvider` and its context.
 */
export { useTheme } from '@/components/ui/useTheme'
