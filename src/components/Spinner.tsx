/**
 * Spinner — `.pen`: `Spinner / Brand / MD 24`.
 *
 * The design file draws a static `refresh` glyph rotated 45°, because a canvas
 * cannot animate. In code the same glyph spins; that is the intent the static
 * frame stands in for, so this is the one place the handoff adds motion.
 */
import { Icon } from './Icon';
import { cn } from './cn';

export interface SpinnerProps {
  /** `.pen` defines md (24) only; 16 and 20 exist for in-button use. */
  size?: 16 | 20 | 24;
  /**
   * `brand` is the documented standalone colour. `inherit` lets a container
   * drive it — a primary button needs `color-text-on-brand`, not brand.
   */
  tone?: 'brand' | 'inherit';
  /** Announced to assistive tech when the spinner is the only loading cue. */
  title?: string;
  className?: string;
}

export function Spinner({ size = 24, tone = 'brand', title, className }: SpinnerProps) {
  return (
    <Icon
      name="refresh"
      size={size}
      title={title}
      className={cn('animate-spin', tone === 'brand' && 'text-text-brand', className)}
    />
  );
}
