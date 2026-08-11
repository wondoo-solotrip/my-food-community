/**
 * Joins truthy class names.
 *
 * Deliberately not `tailwind-merge`: every component below picks its classes
 * from a lookup table keyed by variant, so two competing utilities for the same
 * CSS property never end up in the same string. A caller-supplied `className`
 * comes last and wins by source order within `@layer utilities`.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
