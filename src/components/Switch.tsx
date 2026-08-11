/**
 * Switch — `.pen`: `Switch / {OFF|ON} / {DEFAULT|DISABLED} / {SM|MD}`.
 *
 * Track geometry is taken literally from the design: sm 32×16 with a 12px thumb,
 * md 40×20 with a 16px thumb, both inset 2px. The ON offset is therefore
 * `track − thumb − 2×inset`, i.e. 16px and 20px.
 *
 * Note the OFF track is `color-background-inverse` (a dark neutral), not a grey
 * tint — that is what the design file specifies.
 */
import { cn } from './cn';

export type SwitchState = 'default' | 'disabled';
export type SwitchSize = 'sm' | 'md';

const TRACK: Record<SwitchSize, string> = {
  sm: 'h-4 w-8',
  md: 'h-5 w-10',
};

const THUMB: Record<SwitchSize, string> = {
  sm: 'size-3',
  md: 'size-4',
};

/** How far the thumb travels when ON. */
const THUMB_ON: Record<SwitchSize, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
};

const LABEL: Record<SwitchState, string> = {
  default: 'text-text-default',
  disabled: 'text-text-disabled',
};

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children' | 'value'> {
  label: string;
  checked?: boolean;
  state?: SwitchState;
  size?: SwitchSize;
}

export function Switch({
  label,
  checked = false,
  state = 'default',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: SwitchProps) {
  const disabled = state === 'disabled';

  return (
    <button
      type={type}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 text-left',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          'relative shrink-0 rounded-full',
          TRACK[size],
          disabled
            ? 'bg-background-disabled'
            : checked
              ? 'bg-background-brand'
              : 'bg-background-inverse',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full transition-transform',
            THUMB[size],
            checked && THUMB_ON[size],
            disabled ? 'bg-text-disabled' : 'bg-background-surface',
          )}
        />
      </span>

      <span className={cn('type-body-md', LABEL[state])}>{label}</span>
    </button>
  );
}
