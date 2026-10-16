export const REVIEW_SORT_OPTIONS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
] as const
export type ReviewSort = (typeof REVIEW_SORT_OPTIONS)[number]['value']
