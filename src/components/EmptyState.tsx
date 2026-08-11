/**
 * EmptyState — `.pen`: `Empty State / Default`.
 *
 * Visual, description and actions are all optional; only the heading is not.
 * The action row is fixed by the guide at one secondary plus one primary button,
 * in that order — secondary sits on the left in the design file.
 */
import { Button } from './Button';
import { Icon } from './Icon';
import { cn } from './cn';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
}

export interface EmptyStateProps extends React.ComponentPropsWithoutRef<'div'> {
  title: string;
  description?: string;
  /** Icon name for the circular visual, or a node for a full illustration. */
  visual?: string | React.ReactNode;
  /** Guide: primary 1개 + secondary 1개. */
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
}

export function EmptyState({
  title,
  description,
  visual,
  primaryAction,
  secondaryAction,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 p-6', className)}
      {...rest}
    >
      {visual && (
        <div className="flex size-16 items-center justify-center rounded-full border border-border-brand bg-background-surface text-text-brand">
          {typeof visual === 'string' ? <Icon name={visual} size={32} /> : visual}
        </div>
      )}

      <h2 className="type-heading-sm text-text-default">{title}</h2>

      {description && (
        <p className="type-body-md max-w-[300px] text-center text-text-secondary">{description}</p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>}
        </div>
      )}
    </div>
  );
}
