/**
 * Badge — `.pen`: `Badge / {NEUTRAL|SUCCESS|ERROR|INFO|WARNING} / {MD|LG}`.
 *
 * NEUTRAL is the odd one out: it is a solid dark pill, so the design file sets
 * its border to the *same* token as its fill. The four status types are outlined
 * pills on the card surface instead. Both sizes use 8px horizontal padding — only
 * the height changes.
 */
import { cn } from './cn';

export type BadgeType = 'neutral' | 'success' | 'error' | 'info' | 'warning';
export type BadgeSize = 'md' | 'lg';

const TYPE: Record<BadgeType, string> = {
  neutral: 'bg-background-inverse border-background-inverse text-text-inverse',
  success: 'bg-background-surface border-border-success text-text-success',
  error: 'bg-background-surface border-border-error text-text-error',
  info: 'bg-background-surface border-border-information text-text-information',
  warning: 'bg-background-surface border-border-warning text-text-warning',
};

const SIZE: Record<BadgeSize, string> = { md: 'h-5', lg: 'h-6' };

export interface BadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  label: string;
  type?: BadgeType;
  size?: BadgeSize;
}

export function Badge({ label, type = 'neutral', size = 'md', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'type-label-md inline-flex items-center justify-center rounded-full border px-2',
        SIZE[size],
        TYPE[type],
        className,
      )}
      {...rest}
    >
      {label}
    </span>
  );
}
