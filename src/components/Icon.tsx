/**
 * The iconography foundation as a real component.
 *
 * Glyph geometry comes from `foundation/icons.ts`, generated out of design.pen.
 * Paths are filled with `currentColor`, so an icon takes the colour of whatever
 * `text-*` token its container sets — which is exactly how the .pen components
 * bind icon fills (`$color-text-secondary`, `$color-text-on-brand`, …).
 */
import { ICONS, ICONS_BY_NAME, ICON_VIEW_BOX } from '../foundation/icons';
import { cn } from './cn';

/** Icon names available in the design system, for story controls. */
export const ICON_NAMES = ICONS.map((i) => i.name);

export interface IconProps {
  name: string;
  /** Design system ships 16 / 20 / 24 / 32. Any px value renders. */
  size?: number;
  /**
   * Accessible name. Leave it off for icons that only decorate text or sit
   * inside a labelled control — those are marked `aria-hidden`.
   */
  title?: string;
  className?: string;
}

export function Icon({ name, size = 24, title, className }: IconProps) {
  const def = ICONS_BY_NAME[name];
  if (!def) throw new Error(`Unknown icon: ${name}`);

  return (
    <svg
      width={size}
      height={size}
      viewBox={ICON_VIEW_BOX}
      preserveAspectRatio="xMidYMid meet"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn('block shrink-0', className)}
    >
      {title && <title>{title}</title>}
      <path d={def.path} fill="currentColor" />
    </svg>
  );
}
