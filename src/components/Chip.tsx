/**
 * Chip — `.pen`: `Chip / {UNSELECTED|SELECTED} / {DEFAULT|DISABLED} / {SM|MD}`.
 *
 * The padding rule is the interesting part: the guide gives a different *left*
 * padding when a leading icon is present (sm 12→6, md 16→8) while the right stays
 * put, so the glyph does not push the label off centre. `.pen` encodes exactly
 * that as `padding: [0, 12, 0, 6]` / `[0, 16, 0, 8]`.
 *
 * A chip is a toggle, so it reports `aria-pressed` rather than a checkbox role.
 */
import { Icon } from './Icon';
import { cn } from './cn';

export type ChipState = 'default' | 'disabled';
export type ChipSize = 'sm' | 'md';

const HEIGHT: Record<ChipSize, string> = { sm: 'h-6', md: 'h-8' };

/** Left padding shrinks only when the icon is there to fill the space. */
const PADDING: Record<ChipSize, { withIcon: string; withoutIcon: string }> = {
  sm: { withIcon: 'pr-3 pl-1.5', withoutIcon: 'px-3' },
  md: { withIcon: 'pr-4 pl-2', withoutIcon: 'px-4' },
};

export interface ChipProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  label: string;
  selected?: boolean;
  state?: ChipState;
  size?: ChipSize;
  /** Always 16px, at every chip size. */
  leadingIcon?: string;
}

export function Chip({
  label,
  selected = false,
  state = 'default',
  size = 'md',
  leadingIcon,
  className,
  type = 'button',
  ...rest
}: ChipProps) {
  const disabled = state === 'disabled';
  const padding = PADDING[size][leadingIcon ? 'withIcon' : 'withoutIcon'];

  return (
    <button
      type={type}
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-full border',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        'type-label-lg',
        HEIGHT[size],
        padding,
        disabled
          ? 'bg-background-disabled border-border-disabled text-text-disabled'
          : selected
            ? 'bg-background-brand border-border-brand text-text-on-brand'
            : 'bg-background-surface border-border-strong text-text-default',
        className,
      )}
      {...rest}
    >
      {leadingIcon && <Icon name={leadingIcon} size={16} />}
      {label}
    </button>
  );
}
