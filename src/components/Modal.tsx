/**
 * Modal — `.pen`: `Modal / Default`.
 *
 * Header / body / footer, over a `color-overlay-dark-50` scrim that closes the
 * dialog when tapped. `.pen` draws it inside a 360×320 phone frame, so `position`
 * exists to switch between that (`absolute`, inside a sized container — how the
 * stories show it) and real app use (`fixed`).
 *
 * The guide writes the title size as "heading-so", which is a typo: the design
 * file uses `heading-sm`, and so does this.
 */
import { Button } from './Button';
import { IconButton } from './IconButton';
import { cn } from './cn';

export interface ModalProps extends React.ComponentPropsWithoutRef<'div'> {
  title: string;
  /** Body copy, or arbitrary content. */
  children?: React.ReactNode;
  primaryAction?: { label: string; onClick?: () => void };
  secondaryAction?: { label: string; onClick?: () => void };
  onClose?: () => void;
  /** `fixed` for app use, `absolute` to sit inside a sized preview frame. */
  position?: 'fixed' | 'absolute';
}

export function Modal({
  title,
  children,
  primaryAction,
  secondaryAction,
  onClose,
  position = 'fixed',
  className,
  ...rest
}: ModalProps) {
  return (
    <div
      className={cn(
        'inset-0 flex items-center justify-center bg-overlay-dark-50 p-5',
        position === 'fixed' ? 'fixed' : 'absolute',
        className,
      )}
      // The scrim is a backdrop, not a control: keyboard users reach the same
      // action through the header's close button, so it is not focusable.
      onClick={onClose}
      {...rest}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="flex w-[320px] flex-col rounded-2xl border border-border-default bg-background-surface shadow-[0_8px_20px_var(--color-shadow-action)]"
      >
        <header className="flex h-14 items-center gap-3 border-b border-border-default px-4">
          <h2 className="type-heading-sm min-w-0 flex-1 text-text-default">{title}</h2>
          <IconButton icon="close" label="닫기" size={32} onClick={onClose} />
        </header>

        <div className="type-body-md p-4 text-text-secondary">{children}</div>

        {(primaryAction || secondaryAction) && (
          <footer className="flex justify-end gap-2.5 px-4 pt-3 pb-4">
            {secondaryAction && (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
