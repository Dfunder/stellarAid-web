/** A class name, or a falsy value that should be skipped. */
export type ClassValue = string | false | null | undefined

/** Joins conditional class names into a single `className` string. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
