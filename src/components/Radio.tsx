/**
 * Radio — `.pen`: `Radio / {UNSELECTED|SELECTED} / {DEFAULT|DISABLED} / {SM|MD}`.
 *
 * No error state exists in the design: the guide gives radios only default and
 * disabled, and puts group-level error messaging under the form instead.
 *
 * The guide also forbids standalone use ("연결범위: 단독 사용 금지"), so `RadioGroup`
 * is the supported entry point and carries the `radiogroup` role.
 */
import { cn } from './cn';

export type RadioState = 'default' | 'disabled';
export type RadioSize = 'sm' | 'md';

const BOX: Record<RadioSize, string> = { sm: 'size-4', md: 'size-5' };

/** `.pen` draws the dot at exactly half the control diameter. */
const DOT: Record<RadioSize, string> = { sm: 'size-2', md: 'size-2.5' };

const LABEL: Record<RadioState, string> = {
  default: 'text-text-default',
  disabled: 'text-text-disabled',
};

export interface RadioProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children' | 'value'> {
  label: string;
  selected?: boolean;
  state?: RadioState;
  size?: RadioSize;
}

export function Radio({
  label,
  selected = false,
  state = 'default',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: RadioProps) {
  const disabled = state === 'disabled';

  return (
    <button
      type={type}
      role="radio"
      aria-checked={selected}
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
          'flex shrink-0 items-center justify-center rounded-full',
          BOX[size],
          disabled ? 'bg-background-disabled' : 'bg-background-surface',
          // Selected thickens the ring to 2px, exactly as in the design file.
          selected
            ? disabled
              ? 'border-2 border-border-disabled'
              : 'border-2 border-border-brand'
            : disabled
              ? 'border border-border-disabled'
              : 'border border-border-strong',
        )}
      >
        {selected && (
          <span
            className={cn(
              'rounded-full',
              DOT[size],
              disabled ? 'bg-text-disabled' : 'bg-background-brand',
            )}
          />
        )}
      </span>

      <span className={cn('type-body-md', LABEL[state])}>{label}</span>
    </button>
  );
}

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Accessible name for the whole group. */
  label: string;
}

/** Radios are group-only, so the group owns the accessible name and the role. */
export function RadioGroup({ label, className, children, ...rest }: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex flex-col gap-2', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
