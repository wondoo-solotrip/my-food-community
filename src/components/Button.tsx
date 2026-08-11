/**
 * Button — `.pen`: `Button / {PRIMARY|SECONDARY|DESTRUCTIVE} / {DEFAULT|DISABLED|LOADING} / {SM|MD|LG}`.
 *
 * The design file holds those 27 combinations as 27 separate components. Here
 * they collapse into one component: `variant` × `size` as props, and the two
 * non-default states as the booleans React already has (`disabled`, `loading`).
 *
 * Horizontal padding is derived, not read: the .pen buttons are fixed-width
 * (120 / 136 / 152) with centred content, so padding only exists as the leftover
 * space. Measured 14 / 16 / 24; sm is rounded to the 12px spacing token since
 * 14 is not on the scale. See the Deviations table in `UIComponents.mdx`.
 */
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Fill + border + label colour per variant, straight from the .pen fills. */
const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-background-brand text-text-on-brand border-transparent',
  secondary: 'bg-background-surface text-text-default border-border-strong',
  destructive: 'bg-background-surface text-text-error border-border-error',
};

/** DISABLED overrides every variant with the same three tokens. */
const DISABLED = 'bg-background-disabled text-text-disabled border-border-disabled';

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3',
  md: 'h-10 gap-2 px-4',
  lg: 'h-12 gap-2 px-6',
};

/** Icon size per button size, as specified in the guide and used in the .pen. */
const ICON_SIZE: Record<ButtonSize, 16 | 20> = { sm: 16, md: 20, lg: 20 };

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** `.pen` LOADING: leading slot becomes a spinner, the label stays. */
  loading?: boolean;
  leadingIcon?: string;
  trailingIcon?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled = false,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconSize = ICON_SIZE[size];

  return (
    <button
      type={type}
      // Loading keeps the variant's enabled colours in the design, but must not
      // accept a second click — so the attribute is set without the styling.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-full border',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        'type-label-lg',
        SIZE[size],
        disabled ? DISABLED : VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size={iconSize} tone="inherit" />
      ) : (
        leadingIcon && <Icon name={leadingIcon} size={iconSize} />
      )}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={iconSize} />}
    </button>
  );
}
